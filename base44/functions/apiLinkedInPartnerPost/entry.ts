import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  linkedinHeaders,
  resolveOrganization,
  uploadLinkedInImage,
  publishPost,
} from '../../shared/linkedin.ts';

// Posts a fresh, AI-varied CreditDecide Partner Program post to the company
// LinkedIn page, with an AI-generated cover image and a call to action to
// /partners. Invoked by the "Saturday Partner Post" workflow and by admins.
const SITE_BASE = 'https://creditdecide.com';
const PARTNER_URL = `${SITE_BASE}/partners`;

function buildImagePrompt() {
  return `A clean, modern editorial cover illustration for a fintech partner program announcement, themed around partnerships, global deployment and reseller networks for an AI underwriting platform. Abstract handshake, network and world motifs, professional teal (#0d9488) and deep navy palette, soft gradient background, minimal, no text, no words, no logos. Wide 16:9 composition.`;
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
    const dryRun = body.dry_run === true;

    // Shared LinkedIn connector token.
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('linkedin');
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json(
        { error: 'LinkedIn connector not connected', detail: e.message },
        { status: 502 }
      );
    }
    if (!accessToken) {
      return Response.json({ error: 'LinkedIn connector not connected' }, { status: 502 });
    }

    const headers = linkedinHeaders(accessToken);
    const { orgUrn, orgName } = await resolveOrganization(accessToken, headers);

    // Generate a fresh, varied partner-program post via the LLM.
    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a short, punchy LinkedIn post (max 2000 characters, no hashtags) announcing the CreditDecide Partner Program for consumer-lending professionals. CreditDecide is an AI-native underwriting operating system for consumer lenders — it reads borrower documents, normalizes data, scores risk and writes an explainable credit memo. Partners deploy CreditDecide to lenders in their region, own the customer relationship, and earn recurring commission on every active subscription — similar to Microsoft's partner model or OpenAI's Deploy Co. Rotate the angle each time: sometimes lead with recurring commission, sometimes with owning your region, sometimes with the deploy-not-just-refer model, sometimes with co-branded governed deployments. Keep it human and specific. End with a single call to action line: "Apply to partner: ${PARTNER_URL}". Return only the post text.`,
    });
    let text =
      typeof generated === 'string' ? generated : generated && generated.content ? generated.content : '';
    text = String(text).trim().replace(/#+\s*$/gm, '').slice(0, 2500);
    if (!text.includes(PARTNER_URL)) {
      text = `${text}\n\nApply to partner: ${PARTNER_URL}`;
    }
    text = `${text}\n\n#AIUnderwriting #Fintech #Partnerships`.slice(0, 2900);

    // Generate a cover image and upload it (best-effort; falls back to text-only).
    let assetUrn = null;
    let imageUrl = null;
    let imageError = null;
    try {
      const gen = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: buildImagePrompt(),
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
        link: PARTNER_URL,
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
      title: 'CreditDecide Partner Program',
      description:
        'Deploy CreditDecide to lenders in your region and earn recurring commission.',
    });

    return Response.json({
      ok: true,
      organization_urn: orgUrn,
      organization_name: orgName,
      post_urn: postUrn,
      link: PARTNER_URL,
      image_url: imageUrl,
      asset_urn: assetUrn,
      has_image: !!assetUrn,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}