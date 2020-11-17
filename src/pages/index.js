import React from "react"
import Layout from "../components/layout"
import Banner from "../components/Banner/banner"
import TextBlock from "../components/TextBlock/textBlock"
import TextBlockImg from "../components/TextBlockImg/textBlockImg"
import TextBlockImg2 from "../components/TextBlockImg/textBlockImg2"
import Button from "../components/Button/button"
import Packages from "../components/Packages/packages"
import Demo from '../components/Demo/Demo';
import Contact from "../components/Contact/contact"
import { Link } from "react-scroll"


export default () => (
  <>
    <Layout>
      <Banner />
        {/*      
      <TextBlock id="about">
      </TextBlock>
        */}
      <TextBlockImg2 id="about" title_jp="英会話の効率的な復習をサポート"　subtitle="">
        {/*
        <Link to="demo" smooth={true} duration={500}>
            <Button label="Try a demo" cta="Try a demo!" />
        </Link>
        */}
      </TextBlockImg2>
      <TextBlockImg id="features" title_jp="アプリの特徴"　subtitle="">
        {/*
        <Link to="demo" smooth={true} duration={500}>
            <Button label="Try a demo" cta="Try a demo!" />
        </Link>
        */}
      </TextBlockImg>

      {/*       
      <Packages
        id="prices"
        title="Prices"
        para="Choose the perfect solution for you. With benefits to suit all budgets LangApp can offer amazing value and expert advice"
      >
      </Packages>
      */}    
      {/* 
      <Demo
        id="demo"
      />
      */}
      <Contact
        id="contact"
      />

    </Layout>
  </>
)
