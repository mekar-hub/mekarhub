const PhilosophySection = () => {
  return (
    <section id="philosophy" className="py-24 md:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">Filosofi</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 leading-tight">
          Digital Legacy Hub
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
          Mekarhub menghubungkan figur, cerita, dan audiens melalui narasi yang jujur, kontekstual, dan bernilai.
        </p>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            { title: "Jujur", desc: "Setiap narasi dibangun di atas kebenaran dan keaslian cerita." },
            { title: "Kontekstual", desc: "Kami memahami konteks lokal dan menyampaikannya dengan tepat." },
            { title: "Bernilai", desc: "Setiap konten membawa dampak positif bagi komunitas." },
          ].map((item) => (
            <div key={item.title} className="text-left">
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
