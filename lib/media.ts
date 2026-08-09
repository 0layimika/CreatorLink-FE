export function optimizeCloudinaryImage(url: string | null | undefined, width: number, height?: number) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url || '';
  const transform = `f_auto,q_auto,dpr_auto,c_fill,w_${width}${height ? `,h_${height}` : ''}`;
  return url.replace('/upload/', `/upload/${transform}/`);
}
