import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';

const CesiumMap = dynamic(() => import('@/components/map/CesiumMap'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <main style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <LoadingScreen />
      <CesiumMap />
    </main>
  );
}
