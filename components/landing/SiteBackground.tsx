'use client';

import { Canvas } from '@react-three/fiber';
import { EnergyRing, ShaderPlane } from '@/components/ui/background-paper-shaders';

export function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.35} />
        <ShaderPlane position={[-1.05, 0.35, -0.2]} color1="#06b6d4" color2="#eef6ff" />
        <ShaderPlane position={[1.0, -0.45, -0.35]} color1="#0ea5e9" color2="#f8fbff" />
        <EnergyRing radius={0.95} position={[0.45, 0.2, 0.1]} />
      </Canvas>
      <div className="absolute inset-0 bg-white/75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.10),transparent_38%),radial-gradient(circle_at_80%_75%,rgba(56,189,248,0.08),transparent_34%)]" />
    </div>
  );
}
