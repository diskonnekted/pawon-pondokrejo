import { sanityFetch } from "@/sanity/lib/live";
import { ARTICLES_QUERY } from "@/sanity/lib/queries";
import { Article } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import { Info } from "lucide-react";

export default async function InfoPage() {
  const { data: articles } = await sanityFetch({ query: ARTICLES_QUERY }) as { data: Article[] };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest mb-4">
          <Info className="w-4 h-4" />
          Kabar Kalurahan
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
          Info & <span className="text-green-600">Pengumuman</span>.
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Dapatkan informasi terbaru mengenai pelatihan UMKM, panduan penggunaan aplikasi PAWON, dan dukungan dari Pemerintah Desa Pondokrejo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xl">Belum ada pengumuman terbaru saat ini.</p>
        </div>
      )}
    </div>
  );
}
