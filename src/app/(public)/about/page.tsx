import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { Heart, Award, Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "關於我們 | 波妮塔美髮沙龍",
  description: "了解波妮塔美髮沙龍的故事、理念與專業團隊",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">關於我們</h1>
        <p className="text-lg text-muted-foreground">
          認識波妮塔美髮沙龍，了解我們的故事與堅持
        </p>
      </div>

      {/* Philosophy Section */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">沙龍理念</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            「波妮塔」源自西班牙語「Bonita」，意為美麗。我們相信每個人都擁有獨特的美，
            而我們的使命就是透過專業的美髮技術與細膩的服務，幫助每一位顧客發現並展現自己的美。
          </p>
          <p>
            自創立以來，波妮塔一直秉持著「以客為本、追求卓越」的精神，
            不斷精進技術、引進優質產品，只為給您最好的美髮體驗。
            我們不只是打理您的頭髮，更是陪伴您一起找到最適合自己的風格。
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <Heart className="mx-auto mb-3 h-8 w-8 text-rose-500" />
            <h3 className="mb-2 font-semibold">用心服務</h3>
            <p className="text-sm text-muted-foreground">
              真心傾聽每位顧客的需求，提供最貼心的服務體驗
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <Award className="mx-auto mb-3 h-8 w-8 text-rose-500" />
            <h3 className="mb-2 font-semibold">專業品質</h3>
            <p className="text-sm text-muted-foreground">
              持續進修最新技術，確保服務品質始終如一
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <Leaf className="mx-auto mb-3 h-8 w-8 text-rose-500" />
            <h3 className="mb-2 font-semibold">優質產品</h3>
            <p className="text-sm text-muted-foreground">
              嚴選環保安全的美髮產品，呵護您的秀髮與頭皮
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Designer Introduction */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">設計師介紹</h2>
        <div className="rounded-lg border p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-rose-100 text-3xl font-bold text-rose-500">
              A
            </div>
            <div>
              <h3 className="mb-1 text-xl font-bold">Amy</h3>
              <p className="mb-3 text-sm text-rose-500">資深設計師 / 店長</p>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  擁有超過 10 年美髮經驗的 Amy，是波妮塔美髮沙龍的靈魂人物。
                  她曾在多家知名沙龍任職，累積豐富的技術經驗與美學素養。
                </p>
                <p>
                  Amy 擅長依據每位顧客的臉型、膚色與生活型態，打造最適合的個人化造型。
                  無論是俐落短髮、浪漫捲髮，還是時尚染髮，她都能精準掌握潮流趨勢，
                  為您帶來兼具質感與實用的完美髮型。
                </p>
                <p>
                  「我希望每位離開沙龍的顧客，都能帶著自信的笑容。」—— Amy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Salon Environment */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">沙龍環境</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            波妮塔美髮沙龍位於台北市大安區，交通便利，鄰近捷運站。
            店內以溫暖的木質色調搭配柔和的燈光，營造出優雅舒適的空間氛圍。
          </p>
          <p>
            我們提供寬敞的座位區、獨立的洗髮空間，以及舒適的等候區。
            每一個角落都經過精心規劃，只為讓您在美髮的過程中，
            享受一段放鬆而美好的時光。
          </p>
          <p>
            此外，我們使用專業級的美髮設備，並定期進行環境清潔與消毒，
            確保每一位顧客都能在乾淨衛生的環境中安心享受服務。
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 text-muted-foreground">
            溫馨舒適的沙龍空間
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 text-muted-foreground">
            專業的美髮設備
          </div>
        </div>
      </section>
    </div>
  );
}
