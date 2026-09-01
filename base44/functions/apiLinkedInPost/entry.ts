import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Posts a published Insights article to the CreditDecide LinkedIn company page,
// with an AI-generated cover image attached.
// Uses the shared LinkedIn connector token (builder's account, which administers the page).
// Invoked by the "Daily Insights" workflow after an article is generated, and by admins.
const SITE_BASE = 'https://creditdecide.com';

const MARKET_NAMES = {
  GB: 'the United Kingdom', US: 'the United States', NG: 'Nigeria',
  ZA: 'South Africa', KE: 'Kenya', GH: 'Ghana', GLOBAL: 'global markets',
};

function buildImagePrompt(title, market) {
  const place = MARKET_NAMES[market] || 'global markets';
  return `A clean, modern editorial cover illustration for a fintech article titled "${title}", themed around AI underwriting and credit decisioning in ${place}. Abstract financial data visualizations, subtle technology motifs, professional teal (#0d9488) and deep navy palette, soft gradient background, minimal, no text, no words, no logos. Wide 16:9 composition.`;
}

// Builds a short, clean prose preview from the article body to tease the post
// before the "read more" link. Strips markdown structure and truncates with an ellipsis.
function buildPreview(content, maxLen = 450) {
  if (!content) return '';
  const clean = String(content)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

// Register a LinkedIn image upload, upload the bytes, and poll until the asset is ready.
// Returns the asset URN, or throws if processing fails/times out (caller falls back to text-only).
async function uploadLinkedInImage(accessToken, headers, orgUrn, imageBytes, contentType) {
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
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
    const mech = value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
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
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': contentType || 'image/jpeg', ...uploadHeaders },
    body: imageBytes,
  });
  const uploadStatus = uploadRes.status;
  if (!uploadRes.ok) {
    const detail = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed (${uploadStatus}): ${detail}`);
  }

  // Poll until the asset is processed (LinkedIn needs this before the post can reference it).
  const assetId = assetUrn.split(':').pop();
  let lastPoll = null;
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const stRes = await fetch(`https://api.linkedin.com/v2/assets/${assetId}`, { headers });
    if (stRes.ok) {
      const stData = await stRes.json();
      lastPoll = stData;
      const recipes = stData.recipes || [];
      const recipe = recipes.find((r) => r.recipe === 'urn:li:digitalmediaRecipe:feedshare-image');
      if (recipe && (recipe.status === 'AVAILABLE' || recipe.status === 'ALLOWED')) return assetUrn;
      if (recipe && recipe.status === 'FAILED') throw new Error('LinkedIn image processing failed');
    } else {
      lastPoll = { httpStatus: stRes.status, body: await stRes.text().catch(() => '') };
    }
  }
  throw new Error('LinkedIn image processing timed out');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Auth guard: allow unauthenticated (workflow) calls, block non-admin direct calls.
    const authed = await base44.auth.isAuthenticated().catch(() => false);
    if (authed) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const slug = body.slug;
    const title = body.title;
    const excerpt = body.excerpt || '';
    const market = body.market || '';
    const dryRun = body.dry_run === true;
    // Fetch the article body to build a content preview teased in the post.
    let content = body.content || '';
    if (!content && slug) {
      try {
        const rows = await base44.asServiceRole.entities.Insight.filter({ slug }, null, 1);
        if (rows && rows[0]) content = rows[0].content || '';
      } catch (_) {}
    }
    const preview = buildPreview(content);
    if (!slug || !title) {
      return Response.json({ error: 'slug and title are required' }, { status: 400 });
    }

    // Shared LinkedIn connector token.
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('linkedin');
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json({ error: 'LinkedIn connector not connected', detail: e.message }, { status: 502 });
    }
    if (!accessToken) {
      return Response.json({ error: 'LinkedIn connector not connected' }, { status: 502 });
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    };

    // Discover organizations the connected user administers.
    const aclRes = await fetch(
      'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED',
      { headers }
    );
    if (!aclRes.ok) {
      const detail = await aclRes.text();
      return Response.json({ error: 'Failed to list LinkedIn organizations', detail }, { status: 502 });
    }
    const aclData = await aclRes.json();
    const elements = (aclData.elements || []).filter((e) => e.organization);
    if (!elements.length) {
      return Response.json({ error: 'No administered LinkedIn organization found for this account' }, { status: 404 });
    }

    // Resolve each admin org's name (usually one or two) to prefer the CreditDecide page.
    const orgUrns = elements.map((e) => e.organization);
    const orgNames = {};
    await Promise.all(orgUrns.map(async (urn) => {
      const numericId = urn.split(':').pop();
      try {
        const r = await fetch(`https://api.linkedin.com/v2/organizations/${numericId}`, { headers });
        if (r.ok) {
          const d = await r.json();
          orgNames[urn] = d.localizedName || (d.name && d.name.localized && d.name.localized.en_US) || '';
        }
      } catch (_) { /* ignore individual lookup failures */ }
    }));

    let orgUrn = orgUrns[0];
    const matchUrn = orgUrns.find((urn) => (orgNames[urn] || '').toLowerCase().includes('creditdecide'));
    if (matchUrn) orgUrn = matchUrn;
    const orgName = orgNames[orgUrn] || '';

    const link = `${SITE_BASE}/insights/${slug}`;
    const parts = [title, ''];
    if (excerpt) parts.push(excerpt, '');
    if (preview) parts.push(preview, '');
    parts.push(`Read the full article: ${link}`, '', '#AIUnderwriting #CreditDecisioning #Fintech');
    const text = parts.join('\n').slice(0, 2900);

    // Generate a cover image and upload it to LinkedIn (best-effort; falls back to text-only).
    let assetUrn = null;
    let imageUrl = null;
    let imageError = null;
    try {
      const gen = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: buildImagePrompt(title, market),
      });
      imageUrl = gen && gen.url;
      if (imageUrl) {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const imgBuf = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          assetUrn = await uploadLinkedInImage(accessToken, headers, orgUrn, imgBuf, contentType);
        }
      }
    } catch (imgErr) {
      assetUrn = null;
      imageError = imgErr && imgErr.message ? imgErr.message : String(imgErr);
    }

    if (dryRun) {
      return Response.json({ ok: true, dry_run: true, organization_urn: orgUrn, organization_name: orgName, link, text, image_url: imageUrl, asset_urn: assetUrn, has_image: !!assetUrn, image_error: imageError });
    }

    const shareContent = {
      shareCommentary: { attributes: [], text },
      shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
    };
    if (assetUrn) {
      shareContent.media = [{
        status: 'READY',
        media: assetUrn,
        title: { attributes: [], text: title.slice(0, 120) },
        description: { attributes: [], text: (excerpt || title).slice(0, 200) },
      }];
    }

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
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
      return Response.json({ error: 'LinkedIn post failed', detail }, { status: 502 });
    }
    const postData = await postRes.json();
    return Response.json({
      ok: true,
      organization_urn: orgUrn,
      organization_name: orgName,
      post_urn: postData.id || postData.activity || null,
      link,
      image_url: imageUrl,
      asset_urn: assetUrn,
      has_image: !!assetUrn,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}