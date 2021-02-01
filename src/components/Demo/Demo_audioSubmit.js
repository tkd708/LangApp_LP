import React from "react"
import styled from "styled-components"
//import Button from '@material-ui/core/Button';
import Button from "../Button/button"

import { useStaticQuery, graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"

import AudioRecorder from '../AudioRecorder/AudioRecorder.js';

const browserLang = 'ja' // tentatively all in Japanese
//(typeof window !== `undefined`)
//? (window.navigator.languages && window.navigator.languages[0]) ||
//         window.navigator.language ||
//         window.navigator.userLanguage ||
//         window.navigator.browserLanguage
// : ''; 

const Demo = ( id ) => {
    const data = useStaticQuery( graphql`
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

    return (
        <BackgroundImage
            //className="background-img"
            id={ id }
            Tag="section"
            fluid={ data.file.childImageSharp.fluid }
            style={ {
                backgroundAttachment: 'fixed',
            } }
        >
            <DemoWrapper>
                <div id="demo"
                    className="content-container"
                    style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }
                >
                    <AudioRecorder />

                </div>
            </DemoWrapper>
        </BackgroundImage>
    )
}

const DemoWrapper = styled.section`
  text-align: center;
  padding: 50px 30px;

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
          font-size: 3.5rem;
        }

        @media (min-width: 1200px) {
          font-size: 4.5rem;
        }

  }

  p {
    margin-bottom: 30px;
            color: black;
             font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }

  }
`

export default Demo
