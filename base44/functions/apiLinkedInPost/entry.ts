import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Posts a published Insights article to the CreditDecide LinkedIn company page.
// Uses the shared LinkedIn connector token (builder's account, which administers the page).
// Invoked by the "Daily Insights" workflow after an article is generated, and by admins.
const SITE_BASE = 'https://creditdecide.com';

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
    const dryRun = body.dry_run === true;
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
    parts.push(`Read the full article: ${link}`, '', '#AIUnderwriting #CreditDecisioning #Fintech');
    const text = parts.join('\n').slice(0, 2900);

    if (dryRun) {
      return Response.json({ ok: true, dry_run: true, organization_urn: orgUrn, organization_name: orgName, link, text });
    }

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: orgUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugcpost.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugcpost.VisibilityEnum': 'PUBLIC' },
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
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}