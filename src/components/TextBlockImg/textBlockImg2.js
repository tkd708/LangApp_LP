import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"
import Perk from "../Perk/perk"
import styled from "styled-components"
import Button from "../Button/button"

import cardImg1 from "../../images/chat-laptop.jpg"
import cardImg2 from "../../images/speech-recognition.jpg"
import cardImg3 from "../../images/dashboard.jpg"

import serviceConceptImg from "../../images/service-concept.jpg"

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';

const TextBlockImg2 = ({ title_en, title_jp, children, subtitle, id }) => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "book-bindings.jpg" }) {
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
      style={{
            backgroundAttachment: 'fixed' ,
           }}
    >
      <TextBlockImgWrapper>
        <div className="content-container">
          <h2>{title_en}</h2>
          <h2>{title_jp}</h2>
          <p>{subtitle}</p>
          {children}
        <div className="flex-container trio-block">
            <Card className='card'>
                <CardMedia
                    component="img"
                    image={cardImg1}
                    title="analyse conversation"
                    style={{height: '30vh'}}
                    />
                <CardContent>
                <Typography color="textSecondary" component="h3">STEP 1</Typography>
                <Typography　 component="h3">{`英会話を録音`}</Typography>
                <Typography variant="body2" component="p">
                    {`ウェブ・モバイルアプリであなたの普段の英会話やレッスンを録音しましょう。`}
                </Typography>
                </CardContent>
            </Card>
            <Card className='card'>
                <CardMedia
                    component="img"
                    image={cardImg2}
                    title="analyse conversation"
                    style={{height: '30vh'}}
                    />
                <CardContent>
                <Typography color="textSecondary" component="h3">STEP 2</Typography>
                <Typography　 component="h3">{`全ての会話を分析`}</Typography>
                <Typography variant="body2" component="p">
                    {`AIによる音声認識技術を用いてアプリが会話を書き起こし、内容を分析します。`}
                </Typography>
                </CardContent>
            </Card>
            <Card className='card' >
                <CardMedia
                    component="img"
                    image={cardImg3}
                    title="analyse conversation"
                    style={{height: '30vh'}}
                    />
                <CardContent>
                <Typography color="textSecondary" component="h3">STEP 3</Typography>
                <Typography　 component="h3">{`課題を報告`}</Typography>
                <Typography variant="body2" component="p">
                    {`蓄積された会話の記録からあなたの上達を可視化し次回への課題をまとめます。`}
                </Typography>
                </CardContent>
            </Card>
        </div>
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

  .loading::after {
  filter: blur(15px);
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
    -webkit-text-fill-color: white; /* need to be 'transparent' to apply the color gradient*/
    font-weight: 700;

    font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.0rem;
        }

        @media (min-width: 1200px) {
          font-size: 3.5rem;
        }
  }

  h3 {
    font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.5rem;
        }

        @media (min-width: 1200px) {
          font-size: 2.0rem;
        }

  }

  p {
    margin-bottom: 10px;
    font-size: 1.0rem;

        @media (min-width: 768px) {
          font-size: 1.15rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.3rem;
        }

  }

    .card {
    width: 100%;
    align-self: centre;
    margin-bottom: 30px;
    
        @media (min-width: 768px) {
            margin: 20px;
            max-width: 300px;
        }

  }

`

export default TextBlockImg2
