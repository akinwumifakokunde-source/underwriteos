import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  linkedinHeaders,
  resolveOrganization,
  uploadLinkedInImage,
  publishPost,
} from '../../shared/linkedin.ts';

// Posts a published Insights article to the CreditDecide LinkedIn company page,
// with an AI-generated cover image attached.
// Uses the shared LinkedIn connector token (builder's account, which administers the page).
// Invoked by the "Daily Insights" workflow after an article is generated, and by admins.
const SITE_BASE = 'https://creditdecide.com';

function buildImagePrompt(title) {
  return `A clean, modern editorial cover illustration for a fintech article titled "${title}", themed around AI underwriting and credit decisioning for consumer lenders worldwide. Abstract financial data visualizations, subtle technology motifs, professional teal (#0d9488) and deep navy palette, soft gradient background, minimal, no text, no words, no logos. Wide 16:9 composition.`;
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

export default async function (req) {
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

    const headers = linkedinHeaders(accessToken);
    const { orgUrn, orgName } = await resolveOrganization(accessToken, headers);

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
        prompt: buildImagePrompt(title),
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
      return Response.json({
        ok: true,
        dry_run: true,
        organization_urn: orgUrn,
        organization_name: orgName,
        link,
        text,
        image_url: imageUrl,
        asset_urn: assetUrn,
        has_image: !!assetUrn,
        image_error: imageError,
      });
    }

    const postUrn = await publishPost(accessToken, headers, orgUrn, {
      text,
      assetUrn,
      title: title.slice(0, 120),
      description: (excerpt || title).slice(0, 200),
    });

    return Response.json({
      ok: true,
      organization_urn: orgUrn,
      organization_name: orgName,
      post_urn: postUrn,
      link,
      image_url: imageUrl,
      asset_urn: assetUrn,
      has_image: !!assetUrn,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}