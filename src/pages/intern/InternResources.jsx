/**
 * InternResources — Intern "All Resources" hub.
 *
 * Three tabs:
 *   1. Task Guides   — step-by-step guides posted by admin
 *   2. Video Guides  — video links / YouTube embeds
 *   3. Announcements — all visible announcements
 */
import React, { useEffect, useState, useMemo } from 'react';
import useResourceStore from '../../store/resourceStore';
import useGuideStore from '../../store/guideStore';
import useAnnouncementStore from '../../store/announcementStore';
import useAuthStore from '../../store/authStore';
import { Modal } from '../../components/common';
import { GuideViewer } from '../admin/GuidesModule';

const TABS = ['Task Guides', 'Video Guides', 'Announcements'];

const IMPORTANCE_STYLES = {
  Info:      'border-l-blue-500 bg-blue-50',
  Warning:   'border-l-amber-500 bg-amber-50',
  Important: 'border-l-red-500 bg-red-50',
};

const CATEGORY_COLORS = {
  General: 'bg-gray-100 text-gray-700',
  Onboarding: 'bg-purple-100 text-purple-700',
  Technical: 'bg-blue-100 text-blue-700',
  'Soft Skills': 'bg-pink-100 text-pink-700',
  'HR & Policy': 'bg-amber-100 text-amber-700',
  Tools: 'bg-cyan-100 text-cyan-700',
  Process: 'bg-green-100 text-green-700',
};

function isYouTube(url) { return /youtube\.com|youtu\.be/.test(url); }
function getYouTubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function InternResources() {
  const { resources, loadResources } = useResourceStore();
  const { guides, loadGuides }       = useGuideStore();
  const { announcements, loadAnnouncements, getVisibleAnnouncements } = useAnnouncementStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [activeTab, setActiveTab] = useState(0);
  const [viewGuide, setViewGuide] = useState(null);

  useEffect(() => {
    loadResources();
    loadGuides();
    loadAnnouncements();
  }, []);

  const dept = currentUser?.department ?? '';

  const visibleGuides = useMemo(
    () => guides.filter((g) => g.visibleTo === 'All' || g.visibleTo === dept),
    [guides, dept]
  );

  const visibleVideos = useMemo(
    () => resources.filter((r) => r.visibleTo === 'All' || r.visibleTo === dept),
    [resources, dept]
  );

  const visibleAnnouncements = useMemo(
    () => getVisibleAnnouncements(dept).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [announcements, dept]
  );

  const counts = [visibleGuides.length, visibleVideos.length, visibleAnnouncements.length];

  return (
    <section aria-label="Resources Hub">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Resources</h1>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-6" role="tablist">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent -mb-px flex items-center gap-1.5 ${
              activeTab === idx
                ? 'border-accent text-accent'
                : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
          >
            {tab}
            {counts[idx] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === idx ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                {counts[idx]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Task Guides ── */}
      {activeTab === 0 && (
        <div>
          {visibleGuides.length === 0 ? (
            <EmptyState icon="📖" text="No guides available yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleGuides.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setViewGuide(guide)}
                  className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow text-left p-5 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-textPrimary leading-snug">{guide.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[guide.category] ?? 'bg-gray-100 text-gray-700'}`}>
                      {guide.category}
                    </span>
                  </div>
                  {guide.summary && <p className="text-xs text-textSecondary mb-3 line-clamp-2">{guide.summary}</p>}
                  <p className="text-xs text-accent font-medium">{guide.steps.length} step{guide.steps.length !== 1 ? 's' : ''} →</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 1: Video Guides ── */}
      {activeTab === 1 && (
        <div>
          {visibleVideos.length === 0 ? (
            <EmptyState icon="🎬" text="No video guides available yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibleVideos.map((resource) => {
                const ytId = isYouTube(resource.url) ? getYouTubeId(resource.url) : null;
                return (
                  <div key={resource.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    {ytId ? (
                      <div className="aspect-video bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={resource.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-32 bg-gradient-to-br from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Open Resource
                      </a>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-textPrimary text-sm mb-1">{resource.title}</h3>
                      {resource.description && <p className="text-xs text-textSecondary mb-2">{resource.description}</p>}
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{resource.category}</span>
                      <p className="text-xs text-textSecondary mt-2">
                        By {resource.createdBy} · {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Announcements ── */}
      {activeTab === 2 && (
        <div>
          {visibleAnnouncements.length === 0 ? (
            <EmptyState icon="📢" text="No announcements yet." />
          ) : (
            <div className="space-y-4">
              {visibleAnnouncements.map((ann) => (
                <article
                  key={ann.id}
                  className={`border-l-4 rounded-r-xl p-5 shadow-sm ${IMPORTANCE_STYLES[ann.importance] ?? 'border-l-gray-400 bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-textPrimary">{ann.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ann.importance === 'Important' ? 'bg-red-100 text-red-700' :
                      ann.importance === 'Warning'   ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{ann.importance}</span>
                  </div>
                  <p className="text-sm text-textPrimary mb-2">{ann.body}</p>
                  <p className="text-xs text-textSecondary">
                    {ann.createdBy} · {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guide viewer modal */}
      {viewGuide && (
        <Modal isOpen={!!viewGuide} onClose={() => setViewGuide(null)} title={viewGuide.title} size="xl">
          <GuideViewer guide={viewGuide} />
        </Modal>
      )}
    </section>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <span className="text-5xl mb-3" aria-hidden="true">{icon}</span>
      <p className="text-textSecondary text-sm">{text}</p>
    </div>
  );
}

export default InternResources;
