import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { invoke } from '@tauri-apps/api/core';
import { Slide, usePresentationStore } from '../store/presentationStore';

const mockSlides: Slide[] = [
  { id: '1', name: 'Verse 1', index: 0 },
  { id: '2', name: 'Chorus', index: 1 },
  { id: '3', name: 'Bridge', index: 2 },
];

export const SlideGrid: React.FC = () => {
  const {
      selectedSlideIds,
      lastSelectedSlideId,
      liveSlideId,
      cuedSlideId,
      setSelectedSlideIds,
      setLastSelectedSlideId,
      setLiveSlideId,
      setCuedSlideId
  } = usePresentationStore();

  const handleSelect = (slideId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
        const newSet = new Set(selectedSlideIds);
        if (newSet.has(slideId)) newSet.delete(slideId);
        else newSet.add(slideId);
        setSelectedSlideIds(newSet);
    } else if (event.shiftKey && lastSelectedSlideId !== null) {
      const allIds = mockSlides.map(s => s.id);
      const fromIdx = allIds.indexOf(lastSelectedSlideId);
      const toIdx = allIds.indexOf(slideId);
      const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
      setSelectedSlideIds(new Set(allIds.slice(start, end + 1)));
    } else {
      setSelectedSlideIds(new Set([slideId]));
      setLastSelectedSlideId(slideId);
    }
  };

  const sendSlideToLive = async (slideId: string) => {
    setLiveSlideId(slideId);
    await invoke('video::set_live_slide', { slideId }).catch(console.error);
  };

  const setSlideCued = async (slideId: string) => {
    setCuedSlideId(slideId);
    await invoke('video::set_cued_slide', { slideId }).catch(console.error);
  };

  const handleDragStart = (slideId: string, event: React.DragEvent) => {
    event.dataTransfer.setData('text/plain', slideId);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {mockSlides.map(slide => {
        const isSelected = selectedSlideIds.has(slide.id);
        const isLive = liveSlideId === slide.id;
        const isCued = cuedSlideId === slide.id;

        return (
          <ContextMenu.Root key={slide.id}>
            <ContextMenu.Trigger>
              <div
                onClick={(e) => handleSelect(slide.id, e)}
                onDoubleClick={() => sendSlideToLive(slide.id)}
                draggable={true}
                onDragStart={(e) => handleDragStart(slide.id, e)}
                onContextMenu={(e) => { e.preventDefault(); handleSelect(slide.id, e); }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendSlideToLive(slide.id);
                  if (e.key === ' ') setSlideCued(slide.id);
                }}
                aria-selected={isSelected}
                aria-label={`Slide: ${slide.name}${isLive ? ', Live' : ''}${isCued ? ', Cued' : ''}`}
                style={{
                  width: '200px', height: '120px', backgroundColor: '#2A2A2A', borderRadius: '8px',
                  border: `2px solid ${isLive ? '#E03A2F' : isSelected ? '#1A56DB' : '#444'}`,
                  position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <span>{slide.name}</span>
                {isLive && <span style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#E03A2F', fontSize: '10px', padding: '2px 4px', borderRadius: '4px' }}>LIVE</span>}
                <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '12px', color: '#888' }}>{slide.index + 1}</span>
                <input type="checkbox" checked={isSelected} readOnly style={{ position: 'absolute', bottom: 4, right: 4 }} />
              </div>
            </ContextMenu.Trigger>

            <ContextMenu.Portal>
              <ContextMenu.Content style={{ backgroundColor: '#2A2A2A', border: '1px solid #444', borderRadius: '6px', padding: '4px', minWidth: '150px', zIndex: 50, color: 'white' }}>
                <ContextMenu.Item onClick={() => sendSlideToLive(slide.id)} style={{ padding: '8px', cursor: 'pointer' }}>Go Live</ContextMenu.Item>
                <ContextMenu.Item onClick={() => setSlideCued(slide.id)} style={{ padding: '8px', cursor: 'pointer' }}>Cue as Next</ContextMenu.Item>
                <ContextMenu.Separator style={{ height: '1px', backgroundColor: '#444', margin: '4px 0' }} />
                <ContextMenu.Item onClick={() => invoke('presentation::duplicate_slide', { slideId: slide.id }).catch(console.error)} style={{ padding: '8px', cursor: 'pointer' }}>Duplicate Slide</ContextMenu.Item>
                <ContextMenu.Item onClick={() => invoke('project::delete_slide', { slideId: slide.id }).catch(console.error)} style={{ padding: '8px', cursor: 'pointer', color: '#FF6B6B' }}>Delete Slide</ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        );
      })}
    </div>
  );
};
