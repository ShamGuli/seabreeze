import dynamic from 'next/dynamic';
import './mobile-map.css';

const MobileMap = dynamic(() => import('@/components/map/MobileMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw', height: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#555', fontSize: 14,
    }}>
      Loading map...
    </div>
  ),
});

export default function MobileMapPage() {
  return <MobileMap />;
}
