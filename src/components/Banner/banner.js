import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import styled from "styled-components"
import BackgroundImage from "gatsby-background-image"
import Button from "../Button/button"
import { Link } from "react-scroll"
import { motion } from "framer-motion"

const Banner = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "language-exchange5.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 2000, quality: 90) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)

  const variants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 20 },
  }

    const browserLang =  (typeof window !== `undefined`)
   ? (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage
    : 'ja'; // tentatively all in Japanese

  return (
    <BannerWrapper>
      <BackgroundImage
        Tag="section"
        className="hero-image grayscale"
        fluid={data.file.childImageSharp.fluid}
      >
        <div className="hero-content">
          <motion.h1
            initial="hidden"
            className="logo"
            animate="visible"
            variants={variants}
            transition={{ ease: "easeOut", duration: 0.8, delay: 1 }}
          >
            <span>LangApp</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ ease: "easeOut", duration: 0.8, delay: 1.5 }}
          >
           {browserLang=='ja'
        ? `英会話を記録・分析し上達を加速するアプリ` 
        : "A solution to boost your conversation skills"}
          </motion.p>
          
          <iframe
            className="youtube"
            id="ytplayer"
            type="text/html"
            width="640"
            height="360"
            src="https://www.youtube.com/embed/35OEaPsgZGA?autoplay=1&origin=http://langapp.netlify.app"
            frameborder="0"
          />
          <Link to="about" smooth={true} duration={500}>
            <span className="sr-only">Jump to about</span>
            <Button
              cta="Learn More"
              label="Banner Learn More"
              anchor={true}
              href="linking"
            />
          </Link>
        </div>
      </BackgroundImage>
    </BannerWrapper>
  )
}

const BannerWrapper = styled.section`
  .gatsby-image-wrapper {
    height: 100vh;
    color: #fff;
    }

    .logo {
    }

    .grayscale {
    }

    .youtube {
        align-self: center;
        margin-bottom: 50px;

        @media (max-width: 768px) {
          width: 100%;
        }

    }

    .hero-content {
      text-align: center;
      height: 100%;
      width: 100%;
      max-width: 400px;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;

      @media (min-width: 768px) {
        max-width: 650px;
      }

      h1 {
        font-size: 2.5rem;
        line-height: 1.2;

        @media (min-width: 768px) {
          font-size: 3.5rem;
        }

        @media (min-width: 1200px) {
          font-size: 4.5rem;
        }


        span {
          background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      p {
        margin-top: 0;
        margin-bottom: 2rem;
        line-height: 1.2;
        font-size: 1.3rem;

        @media (min-width: 768px) {
          font-size: 1.5rem;
        }

        @media (min-width: 1200px) {
          font-size: 2rem;
        }
      }

      button,
      .anchor {
        margin: 0 auto;
      }

      @media (min-width: 768px) {
        max-width: 800px;

        h1 {
          font-size: 3rem;
        }
      }

      @media (min-width: 1200px) {
        h1 {
          font-size: 4rem;
        }
      }
    }
  }
`

export default Banner
