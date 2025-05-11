
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, Star, Sparkles, Target, Mic } from "lucide-react";

const Index = () => {
  const { t } = useTranslation("common");
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-khadma-blue/10 to-khadma-lightBlue/10 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-khadma-darkBlue mb-6 animate-fade-in">
                {t("home.hero.title")}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {t("home.hero.subtitle")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={currentUser ? "/dashboard" : "/signup"}>
                  <Button
                    size="lg"
                    className="bg-khadma-blue hover:bg-khadma-darkBlue text-white font-semibold group flex items-center"
                  >
                    {t("home.hero.cta")}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/quests">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-khadma-blue text-khadma-blue hover:bg-khadma-blue hover:text-white font-semibold"
                  >
                    {t("nav.quests")}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-khadma-blue font-bold text-4xl mb-2">500+</div>
                  <div className="text-gray-600">Available Quests</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-khadma-blue font-bold text-4xl mb-2">2,000+</div>
                  <div className="text-gray-600">Skilled Users</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-khadma-blue font-bold text-4xl mb-2">10,000+</div>
                  <div className="text-gray-600">Completed Tasks</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-khadma-darkBlue">
                {t("home.features.title")}
              </h2>
              <div className="w-24 h-1 bg-khadma-blue mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <Card className="border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-khadma-blue/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-khadma-blue/20 transition-colors">
                    <Sparkles className="w-8 h-8 text-khadma-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-khadma-darkBlue">
                    {t("home.features.parser.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("home.features.parser.description")}
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-khadma-blue/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-khadma-blue/20 transition-colors">
                    <Star className="w-8 h-8 text-khadma-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-khadma-darkBlue">
                    {t("home.features.quests.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("home.features.quests.description")}
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-khadma-blue/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-khadma-blue/20 transition-colors">
                    <Target className="w-8 h-8 text-khadma-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-khadma-darkBlue">
                    {t("home.features.tasks.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("home.features.tasks.description")}
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-khadma-blue/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-khadma-blue/20 transition-colors">
                    <Mic className="w-8 h-8 text-khadma-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-khadma-darkBlue">
                    {t("home.features.simulator.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("home.features.simulator.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-khadma-blue to-khadma-darkBlue py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to transform your skills into opportunities?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are leveraging AI to advance their careers.
            </p>
            <Link to={currentUser ? "/dashboard" : "/signup"}>
              <Button
                size="lg"
                className="bg-white text-khadma-blue hover:bg-gray-100 font-semibold"
              >
                {currentUser ? "Go to Dashboard" : "Create Free Account"}
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
