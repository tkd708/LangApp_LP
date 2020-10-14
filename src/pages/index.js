import React from "react"
import Layout from "../components/layout"
import Banner from "../components/Banner/banner"
import TextBlock from "../components/TextBlock/textBlock"
import TextBlockImg from "../components/TextBlockImg/textBlockImg"
import Perk from "../components/Perk/perk"
import Button from "../components/Button/button"
import Packages from "../components/Packages/packages"
import Package from "../components/Package/package"
import Contact from "../components/Contact/contact"
import { Link } from "react-scroll"

import perk1Img from "../images/language-exchange.jpg"
import perk2Img from "../images/speech-to-text.png"
import perk3Img from "../images/word-cloud.png"

import { IconContext } from "react-icons"
import { MdDone, MdClear } from "react-icons/md"

// LP example
// https://www.autopilothq.com/
// https://www.hubspot.com/crm/e010a

// Starters
// https://www.gatsbyjs.com/starters/gillkyle/gatsby-starter-landing-page
// https://www.gatsbyjs.com/starters/codebushi/gatsby-starter-lander
// https://www.gatsbyjs.com/starters/anubhavsrivastava/gatsby-starter-newage
// https://www.gatsbyjs.com/starters/anubhavsrivastava/gatsby-starter-eventually
// https://www.gatsbyjs.com/starters/app-generator/gatsbyjs-starter-tailwindplay

export default () => (
  <>
    <Layout>
      <Banner />
      <TextBlock id="about" title="Learn from your own words" paragraph="">
        <Link to="features" smooth={true} duration={500}>
          <Button label="Tell Me More" cta="How it works?" />
        </Link>
      </TextBlock>
      <TextBlockImg id="features" title="Features of LangApp " subtitle="">
        <div className="flex-container trio-block">
          <Perk
            img={perk1Img}
            alt="Instant conversation"
            title="Instant conversation"
            content="You will be instantly connected to short and yet informative conversation with native speakers"
          />
          <Perk
            img={perk2Img}
            alt="Auto-transcription"
            title="Auto-transcription"
            content="Auto-generate transcription can support to review the conversation and corrections from the buddy"
          />
          <Perk
            img={perk3Img}
            alt="Expression dashbord"
            title="Expression dashboard"
            content="Your own words and expressions are stored in the app and analysed to visualise your output vocabrary, suggesting ways to improve"
          />
        </div>
      </TextBlockImg>
      {/* 
      <Packages
        id="prices"
        title="Prices"
        para="Choose the perfect solution for you. With benefits to suit all budgets LangApp can offer amazing value and expert advice"
      >
        <IconContext.Provider
          value={{
            color: "#7FFF00",
            size: "1.2em",
            style: { verticalAlign: "middle", marginRight: "5px" },
          }}
        >
          <Package title="Free">
            <ul>
              <li>
                <MdDone />1 User
              </li>
              <li>
                <MdDone />
                1GB Storage
              </li>
              <li className="linethrough">
                <MdClear color="red" />
                Dedicated Advisor
              </li>
              <li className="linethrough">
                <MdClear color="red" />
                24/7 Support
              </li>
            </ul>
            <Link to="contact" smooth={true} duration={500}>
              <Button label="I want this" cta="I want this!" />
            </Link>
          </Package>
          <Package title="Intense" active={true}>
            <ul>
              <li>
                <MdDone />
                24/7 Support
              </li>
              <li>
                <MdDone />
                Dedicated Advisor
              </li>
              <li>
                <MdDone />
                Unlimited Storage
              </li>
              <li>
                <MdDone />
                Unlimited Users
              </li>
            </ul>
            <Link to="contact" smooth={true} duration={500}>
              <Button label="I want this" cta="I want this!" />
            </Link>
          </Package>
          <Package title="Standard">
            <ul>
              <li>
                <MdDone />
                10 Users
              </li>
              <li>
                <MdDone />
                500GB Storage
              </li>
              <li>
                <MdDone />
                Advice Support
              </li>
              <li className="linethrough">
                <MdClear color="red" />
                Dedicated Advisor
              </li>
            </ul>
            <Link to="contact" smooth={true} duration={500}>
              <Button label="I want this" cta="I want this!" />
            </Link>
          </Package>
        </IconContext.Provider>
      </Packages>
      */}
      <Contact
        id="contact"
      />
    </Layout>
  </>
)
