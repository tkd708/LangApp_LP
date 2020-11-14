import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"
import Perk from "../Perk/perk"
import styled from "styled-components"
import Button from "../Button/button"

import perk1Img from "../../images/chat-laptop.jpg"
import perk2Img from "../../images/records.jpg"
import perk3Img from "../../images/dashboard.jpg"

import serviceConceptImg from "../../images/service-concept.jpg"


const TextBlockImg = ({ title_en, title_jp, children, subtitle, id }) => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "blackboard.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 2000, quality: 90) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)
  return (
    <BackgroundImage
      //className="background-img"
      id={id}
      Tag="section"
      fluid={data.file.childImageSharp.fluid}
    >
      <TextBlockImgWrapper>
        <div className="content-container">
          <h2>{title_en}</h2>
          <h2>{title_jp}</h2>
          <p>{subtitle}</p>
          {children}
          {/*
          <img
          src={serviceConceptImg}
          alt="service concept"
          style={{display:'flex', flexDirection:'column', justifySelf: 'centre'}}
          />
              */}
        <div className="flex-container trio-block">
          <Perk
            img={perk1Img}
            alt="Instant conversation"
            title_en="Bring LangApp anytime when you talk"
            title_jp="普段の会話やレッスンの際にアプリを起動してそばに置くだけ"
            content="You will be instantly connected to short and yet informative conversation with native speakers"
          />
          <Perk
            img={perk2Img}
            alt="Auto-transcription"
            title_en="Record all the conversations and feedback, making into your assets"
            title_jp="AIを用いた音声認識技術ですべての会話を記録"
            content="Auto-generate transcription can support to review the conversation and corrections from the buddy"
          />
          <Perk
            img={perk3Img}
            alt="Expression dashbord"
            title_en="Overview your improvement"
            title_jp="会話を分析しあなたの成長や次回への課題が一目瞭然に"
            content="Your own words and expressions are stored in the app and analysed to visualise your output vocabrary, suggesting ways to improve"
          />
          </div>
            <Button
              cta= "デモアプリ"
              label="Open mockapp"
              anchor={true}
              target="_blank"
              href="https://www.figma.com/proto/s6v3AqYbMTOCvx7FJuL6ch/LangApp?node-id=0%3A2&viewport=-1418%2C-522%2C0.5&scaling=scale-down"
            />
        </div>
      </TextBlockImgWrapper>
    </BackgroundImage>
  )
}

const TextBlockImgWrapper = styled.section`
  text-align: center;
  padding: 100px 30px;

  .background-img {
    filter: grayscale(80%);
  }

  .content-container {
    max-width: 500px;

    @media (min-width: 768px) {
      max-width: 650px;
    }

    @media (min-width: 1200px) {
      max-width: 900px;
    }
  }

  h2 {
    background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.0rem;
        }

        @media (min-width: 1200px) {
          font-size: 3.5rem;
        }
  }

  p {
    margin-bottom: 50px;

             font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }

  }
`

export default TextBlockImg
