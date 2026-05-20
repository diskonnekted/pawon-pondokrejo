import BottomNav from "@/components/mobile/BottomNav";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <main className="flex-grow">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
