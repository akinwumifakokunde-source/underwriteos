import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { PILLARS, PILLAR_KEYS, FEATURE_SLUGS, AUTHOR, pillarForDay, slugify, buildPrompt, normalizeMarkdown } from '../../shared/insights.ts';

// Generates and publishes one Insights article per weekday, rotating across five
// content pillars (A-E). The pillar is chosen by the current day of week:
//   Mon=A (AI Underwriting) · Tue=B (Credit Decisioning) · Wed=C (Document Intelligence)
//   Thu=D (Lending Operations) · Fri=E (AI + Responsible Lending, flagship)
// Within a pillar, the next article is picked by a per-pillar rotation counter.
// Invoked by the "Daily Insights" workflow (Mon-Fri 9am) and by admins.
// Workflow invocations carry no user token; the function runs under the service role.
// Direct user invocations are allowed only for admins (prevents credit-burn abuse).
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

    // Pick today's pillar by weekday (manual weekend runs fall back to A).
    const pillarKey = pillarForDay(new Date().getDay());
    const pillar = PILLARS[pillarKey];

    // Per-pillar rotation: find the most recent published record for this pillar
    // and advance its pillar_index by one.
    const latestForPillar = await base44.asServiceRole.entities.Insight.filter(
      { status: 'published', pillar: pillarKey },
      '-published_at',
      1
    );
    const lastIndex = latestForPillar && latestForPillar[0] && typeof latestForPillar[0].pillar_index === 'number'
      ? latestForPillar[0].pillar_index
      : -1;
    const nextIndex = lastIndex + 1;
    const topic = pillar.topics[nextIndex % pillar.topics.length];

    // Generate the article via the LLM.
    const prompt = buildPrompt(topic, pillarKey);
    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          category: { type: 'string' },
          seo_keywords: { type: 'array', items: { type: 'string' } },
          reading_time: { type: 'number' },
          related_features: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'excerpt', 'content', 'category', 'seo_keywords', 'reading_time', 'related_features'],
      },
    });

    // Build a unique slug.
    let slug = slugify(generated.title);
    const existing = await base44.asServiceRole.entities.Insight.filter({ slug }, null, 1);
    if (existing && existing.length > 0) {
      slug = `${slug}-${nextIndex}`;
    }

    // Keep only valid feature slugs, falling back to the pillar's hint.
    const valid = new Set(FEATURE_SLUGS);
    let relatedFeatures = (generated.related_features || []).filter((f) => valid.has(f));
    if (relatedFeatures.length === 0) {
      relatedFeatures = [pillar.featureHint];
    }

    const record = await base44.asServiceRole.entities.Insight.create({
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content: normalizeMarkdown(generated.content),
      category: generated.category || pillar.category,
      market: 'GLOBAL',
      market_name: 'Global',
      author_name: AUTHOR.name,
      author_role: AUTHOR.role,
      published_at: new Date().toISOString(),
      reading_time: generated.reading_time || 6,
      related_features: relatedFeatures,
      seo_keywords: generated.seo_keywords || [],
      status: 'published',
      pillar: pillarKey,
      pillar_index: nextIndex,
      rotation_index: nextIndex,
      featured: false,
    });

    return Response.json({
      ok: true,
      slug: record.slug,
      title: record.title,
      excerpt: record.excerpt,
      market: 'GLOBAL',
      pillar: pillarKey,
      pillar_label: pillar.label,
      rotation_index: nextIndex,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}