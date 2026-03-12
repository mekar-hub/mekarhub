const PhilosophySection = () => {
  return (
    <section id="philosophy" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="reveal-on-scroll">
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">Filosofi</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 leading-tight">
            Digital Legacy Hub
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
            Mekarhub menghubungkan figur, cerita, dan audiens melalui narasi yang jujur, kontekstual, dan bernilai.
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            { title: "Jujur", desc: "Setiap narasi dibangun di atas kebenaran dan keaslian cerita." },
            { title: "Kontekstual", desc: "Kami memahami konteks lokal dan menyampaikannya dengan tepat." },
            { title: "Bernilai", desc: "Setiap konten membawa dampak positif bagi komunitas." },
          ].map((item, index) => (
            <div 
              key={item.title} 
              className={`text-left reveal-on-scroll transition-all duration-1000`}
              style={{ transitionDelay: `${(index + 1) * 200}ms` }}
            >
              <div className="w-10 h-1 bg-primary mb-4 rounded-full" />
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
