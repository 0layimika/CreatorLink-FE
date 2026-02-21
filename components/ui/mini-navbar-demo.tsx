import { MiniNavbar } from '@/components/ui/mini-navbar';
import Image from 'next/image';

const DemoOne = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <div className="absolute inset-0">
        <Image
          className="w-full h-full object-cover grayscale"
          src="https://cdn.pixabay.com/photo/2016/06/05/07/59/stars-1436950_1280.jpg"
          alt="Background Stars"
          fill
          sizes="100vw"
        />
      </div>

      <MiniNavbar
        links={[
          { label: 'Manifesto', href: '#1' },
          { label: 'Careers', href: '#2' },
          { label: 'Discover', href: '#3' },
        ]}
        actions={[
          { label: 'LogIn', href: '/login' },
          { label: 'Signup', href: '/signup' },
        ]}
      />

      <main className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4 pt-24">
        <h1 className="text-8xl md:text-9xl font-bold text-white mb-4 tracking-tight drop-shadow-xl">
          MINI NAVBAR
        </h1>
      </main>
    </div>
  );
};

export default DemoOne;
