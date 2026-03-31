import { AppProvider } from "../store/appStore";
import HeroSection from "./home/HeroSection";
import ModelSyncBanner from "./common/ModelSyncBanner";
import StaleDataBanner from "./common/StaleDataBanner";
import FilterBar from "./filters/FilterBar";
import ModelGrid from "./models/ModelGrid";
import ComparisonPanel from "./comparison/ComparisonPanel";
import SmartRecommender from "./recommender/SmartRecommender";
import FaqSection from "./faq/FaqSection";

export default function PageContent() {
  return (
    <AppProvider>
      <HeroSection />
      <ModelSyncBanner />
      <StaleDataBanner />
      <div id="compare">
        <FilterBar />
        <ModelGrid />
      </div>
      <ComparisonPanel />
      <SmartRecommender />
      <FaqSection />
    </AppProvider>
  );
}
