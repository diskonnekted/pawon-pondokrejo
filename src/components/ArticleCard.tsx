import { Article } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

export default function ArticleCard({ article }: { article: Article }) {
  const date = new Date(article.publishedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const categoryColors: Record<string, string> = {
    pelatihan: "bg-purple-100 text-purple-700",
    pengumuman: "bg-blue-100 text-blue-700",
    panduan: "bg-green-100 text-green-700",
  };

  return (
    <Link 
      href={`/info/${article.slug}`}
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.image && (
          <Image
            src={urlFor(article.image).width(800).height(500).url()}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${categoryColors[article.category] || "bg-slate-100 text-slate-700"}`}>
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
          <Calendar className="w-3.5 h-3.5 text-green-600" />
          {date}
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-green-600 transition-colors leading-tight line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
          {article.excerpt || "Baca informasi selengkapnya mengenai dukungan dan kegiatan terbaru dari Kalurahan Pondokrejo."}
        </p>

        <div className="mt-auto flex items-center gap-2 text-green-700 font-black text-xs uppercase tracking-widest">
          Baca Selengkapnya
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
