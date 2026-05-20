import { sanityFetch } from "@/sanity/lib/live";
import { ARTICLE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { Article } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { Calendar, ChevronLeft, Share2 } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const components = {
  types: {
    image: ({ value }: any) => (
      <div className="my-10 relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
        <Image
          src={urlFor(value).width(1200).url()}
          alt={value.alt || "Image"}
          fill
          className="object-cover"
        />
      </div>
    ),
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-4xl font-black mb-6 mt-12 text-slate-900">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-3xl font-black mb-5 mt-10 text-slate-900">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl font-black mb-4 mt-8 text-slate-900">{children}</h3>,
    normal: ({ children }: any) => <p className="text-slate-600 leading-relaxed mb-6 font-medium text-lg">{children}</p>,
  },
};

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: article } = await sanityFetch({
    query: ARTICLE_BY_SLUG_QUERY,
    params: { slug },
  }) as { data: Article | null };

  if (!article) {
    notFound();
  }

  const date = new Date(article.publishedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        href="/info"
        className="inline-flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest mb-8 hover:text-green-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Info Desa
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
          {article.category}
        </span>
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <Calendar className="w-3.5 h-3.5 text-green-600" />
          {date}
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
        {article.title}
      </h1>

      {article.image && (
        <div className="relative aspect-video rounded-[4rem] overflow-hidden shadow-2xl mb-12 border border-slate-100">
          <Image
            src={urlFor(article.image).width(1600).height(900).url()}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-50 shadow-xl shadow-slate-200/50">
        <PortableText value={article.content} components={components} />
      </div>

      <div className="mt-16 flex items-center justify-between p-8 bg-slate-900 rounded-[3rem] text-white">
        <div>
          <h4 className="font-black text-xl mb-1">Butuh bantuan lebih lanjut?</h4>
          <p className="text-slate-400 text-sm font-medium">Hubungi Admin Kalurahan Pondokrejo via WhatsApp</p>
        </div>
        <button className="bg-green-600 p-4 rounded-2xl hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-600/20">
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </article>
  );
}
