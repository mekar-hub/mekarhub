import logo from "@/assets/Logo_Mekar_Hub_1.png";

const Footer = () => (
  <footer className="bg-background border-t py-10">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <img src={logo} alt="Mekarhub" className="h-8 mb-2" />
        <p className="text-sm text-muted-foreground">Digital Legacy Hub — tumbuh & terhubung</p>
      </div>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Mekarhub. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
