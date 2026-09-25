// Shared LinkedIn company-page posting helpers.
// Used by apiLinkedInPost (article shares) and apiLinkedInPartnerPost
// (partner-program posts). Both post to the CreditDecide company page via
// the shared LinkedIn connector token.

const API = 'https://api.linkedin.com/v2';

export function linkedinHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

// Resolve the organization the connected user administers, preferring CreditDecide.
export async function resolveOrganization(accessToken, headers) {
  const aclRes = await fetch(
    `${API}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`,
    { headers }
  );
  if (!aclRes.ok) {
    const detail = await aclRes.text();
    throw new Error(`Failed to list LinkedIn organizations: ${detail}`);
  }
  const aclData = await aclRes.json();
  const elements = (aclData.elements || []).filter((e) => e.organization);
  if (!elements.length) {
    throw new Error('No administered LinkedIn organization found for this account');
  }
  const orgUrns = elements.map((e) => e.organization);
  const orgNames = {};
  await Promise.all(
    orgUrns.map(async (urn) => {
      const numericId = urn.split(':').pop();
      try {
        const r = await fetch(`${API}/organizations/${numericId}`, { headers });
        if (r.ok) {
          const d = await r.json();
          orgNames[urn] =
            d.localizedName ||
            (d.name && d.name.localized && d.name.localized.en_US) ||
            '';
        }
      } catch (_) {
        /* ignore individual lookup failures */
      }
    })
  );
  let orgUrn = orgUrns[0];
  const matchUrn = orgUrns.find((urn) =>
    (orgNames[urn] || '').toLowerCase().includes('creditdecide')
  );
  if (matchUrn) orgUrn = matchUrn;
  return { orgUrn, orgName: orgNames[orgUrn] || '' };
}

// Register a LinkedIn image upload, upload the bytes, and poll until ready.
// Returns the asset URN, or throws if processing fails/times out.
export async function uploadLinkedInImage(
  accessToken,
  headers,
  orgUrn,
  imageBytes,
  contentType
) {
  const registerRes = await fetch(`${API}/assets?action=registerUpload`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: orgUrn,
      },
    }),
  });
  if (!registerRes.ok) {
    const detail = await registerRes.text();
    throw new Error(`LinkedIn registerUpload failed: ${detail}`);
  }
  const regData = await registerRes.json();
  const value = regData.value || regData;
  const assetUrn = value.asset;
  let uploadUrl = value.uploadUrl;
  let uploadHeaders = {};
  if (value.uploadMechanism) {
    const mech =
      value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
    if (mech) {
      if (mech.uploadUrl) uploadUrl = mech.uploadUrl;
      if (mech.headers) uploadHeaders = mech.headers;
    }
  }
  if (!assetUrn || !uploadUrl) {
    throw new Error('LinkedIn registerUpload did not return asset/uploadUrl');
  }

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType || 'image/jpeg',
      ...uploadHeaders,
    },
    body: imageBytes,
  });
  if (!uploadRes.ok) {
    const detail = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed (${uploadRes.status}): ${detail}`);
  }

  const assetId = assetUrn.split(':').pop();
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const stRes = await fetch(`${API}/assets/${assetId}`, { headers });
    if (stRes.ok) {
      const stData = await stRes.json();
      const recipes = stData.recipes || [];
      const recipe = recipes.find(
        (r) => r.recipe === 'urn:li:digitalmediaRecipe:feedshare-image'
      );
      if (recipe && (recipe.status === 'AVAILABLE' || recipe.status === 'ALLOWED'))
        return assetUrn;
      if (recipe && recipe.status === 'FAILED')
        throw new Error('LinkedIn image processing failed');
    }
  }
  throw new Error('LinkedIn image processing timed out');
}

// Publish a post (optionally with an image asset) to the organization page.
// Returns the post URN.
export async function publishPost(
  accessToken,
  headers,
  orgUrn,
  { text, assetUrn, title, description }
) {
  const shareContent = {
    shareCommentary: { attributes: [], text },
    shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
  };
  if (assetUrn) {
    shareContent.media = [
      {
        status: 'READY',
        media: assetUrn,
        title: { attributes: [], text: (title || '').slice(0, 120) },
        description: { attributes: [], text: (description || '').slice(0, 200) },
      },
    ];
  }
  const postRes = await fetch(`${API}/ugcPosts`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author: orgUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  if (!postRes.ok) {
    const detail = await postRes.text();
    throw new Error(`LinkedIn post failed: ${detail}`);
  }
  const postData = await postRes.json();
  return postData.id || postData.activity || null;
}