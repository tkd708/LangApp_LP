import React, { useEffect } from "react"
import styled from "styled-components"
import { useInView } from "react-intersection-observer"
import { motion, useAnimation } from "framer-motion"

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


const Perk = ({ img, alt, title_en, title_jp, content }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    // Percentage of item in view to trigger animation
    threshold: 0.25,
  })

  const browserLang =  'ja' // tentatively all in Japanese
  //(typeof window !== `undefined`)
  // ? (window.navigator.languages && window.navigator.languages[0]) ||
  //          window.navigator.language ||
  //          window.navigator.userLanguage ||
  //          window.navigator.browserLanguage
  //  : ''; 
    
  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])
  return (
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
      <PerkWrapper className="perk">
        <p>{browserLang=='ja' ? title_jp : title_en}</p>
        <img src={img} alt={alt} />
      </PerkWrapper>
    </motion.div>
  )
}

const PerkWrapper = styled.article`
  padding: 1rem;
  max-width: 260px;
  margin: 0 auto;

  @media (min-width: 768px) {
      max-width: 450px;
  }

  img {
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    @media (min-width: 992px) {
      padding: 0 1rem;
    }
  }

  h3 {
    color: black;
    font-weight: 400;
  }

  p {
    margin-bottom: 5px;
    font-size: 1.0rem;
    font-weight: 700;

        @media (min-width: 768px) {
          font-size: 1.2rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.5rem;
        }

  }
`

export default Perk
