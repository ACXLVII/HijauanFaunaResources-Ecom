import Header from '@/components/header'
import Footer from '@/components/footer'

import Temp from '@/app/about/components/sectionTemp'
// import Intro from '@/app/about/components/sectionIntro.js'
// import Info from '@/app/about/components/sectionInfo.js'
// import Companies from '@/app/about/components/sectionCompanies.js'
// import Contact from '@/app/about/components/sectionContact.js'

export default function About() {
  return (
    <div className='bg-[url("/images/backgrounds/SoilBackground.jpg")] bg-cover bg-center bg-fixed'>
      <Header />
      
      <main className="pt-21"> {/* padding for header + green bar */}
        <Temp />
        {/* <Intro />
        <Info />
        <Companies />
        <Contact /> */}
      </main>

      <Footer />
    </div>
  );
}