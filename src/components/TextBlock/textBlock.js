import React, { useEffect } from "react"
import styled from "styled-components"
import { useInView } from "react-intersection-observer"
import { motion, useAnimation } from "framer-motion"

import serviceConceptImg from "../../images/service-concept2.png"

const TextBlock = ({ title_en, title_jp, paragraph, children, id }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    // Percentage of item in view to trigger animation
    threshold: 0.25,
  })

   const browserLang = 'ja' 
   //(typeof window !== `undefined`)
   //? (window.navigator.languages && window.navigator.languages[0]) ||
   //         window.navigator.language ||
   //         window.navigator.userLanguage ||
   //         window.navigator.browserLanguage
   // : ''; // tentatively all in Japanese

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])
  return (
    <TextBlockWrapper id={id}>
      <div className="content-container">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 25 },
          }}
          transition={{ ease: "easeOut", duration: 1.25, delay: 0.35 }}
        >
          <h2>{browserLang=='ja' 
          ? 'サービス概要' 
          : 'How it works?'}</h2>

          <p>{browserLang=='ja' 
          ? 'LangAppが英会話の効率的な復習をサポート！' 
          : 'How it works?'}</p>

          <img
          src={serviceConceptImg}
          alt="service concept"
          style={{display:'flex', flexDirection:'column', justifySelf: 'centre', width: '100%'}}
          />
          {children}
        </motion.div>
      </div>
    </TextBlockWrapper>
  )
}

const TextBlockWrapper = styled.section`
  background-color: #fff;
  color: #fff;
  text-align: left;
  padding: 60px 20px;

  @media (min-width: 768px) {
    padding: 80px 30px;
    text-align: center;
  }

  h2 {
    color: #ee00b3;
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
      color: black;
    margin-bottom: 20px;
    font-size: 24px;
    /* text-shadow: 0px 0px 5px rgba(8, 0, 8, 1); */
    opacity: 0.85;

          font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }
 }

`

export default TextBlock
