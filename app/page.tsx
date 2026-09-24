import UIProvider from "@/components/UIProvider";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ClarityCards from "@/components/ClarityCards";
import Problem from "@/components/Problem";
import LeakCalculator from "@/components/LeakCalculator";
import TheLoop from "@/components/TheLoop";
import SourcesAttribution from "@/components/SourcesAttribution";
import Coach from "@/components/Coach";
import Category from "@/components/Category";
import Proof from "@/components/Proof";
import BookDemo from "@/components/BookDemo";
import Faq from "@/components/Faq";

export default function Home() {
  return (
    <UIProvider>
      <Nav />
      <main>
        <Hero />
        <ClarityCards />
        <Problem />
        <TheLoop />
        <SourcesAttribution />
        <Coach />
        <LeakCalculator />
        <Category />
        <Proof />
        <BookDemo />
        <Faq />
      </main>
    </UIProvider>
  );
}
