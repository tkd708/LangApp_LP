import React, { useState, useEffect } from 'react';
import kuromoji from 'kuromoji';

const TextMining = () => {
    
    const [textAnalysed, setTextAnalysed] = useState(null);

    const DIC_URL = './public/dict';
    const TARGET_POS = ['名詞', '動詞', '形容詞'];
    const NO_CONTENT = '*';
    
    const text = `
    そこも場合もうその病気らに対して旨の時がしんませ。単に事実に使用方はどうかその応用たないでもが思いてならないがも発展思いうべきて、あいにくにもなるだなですた。
    `

    const vocabAnalysis = () => {
              console.log('vocab analysis started! with dictionary at: ' + DIC_URL + " for text: " + text)

    kuromoji.builder({ dicPath: DIC_URL }).build((err, tokenizer) => {
      if(err){
        console.log('kuromoji build failed' + err)
        return
      }
      else{
      console.log('kuromoji build success!')

      // テキストを引数にして形態素解析
      const tokens = tokenizer.tokenize(text)

      console.log('kuromoji raw results: ' + tokens )
            // 解析結果から単語と出現回数を抽出
      const dataForD3Cloud = tokens
        // pos（品詞）を参照し、'名詞', '動詞', '形容詞'のみを抽出
        .filter(t => TARGET_POS.includes(t.pos))
        // 単語を抽出(basic_formかsurface_formに単語が存在する)
        .map(t => t.basic_form === NO_CONTENT ? t.surface_form : t.basic_form)
        // [{text: 単語, value: 出現回数}]の形にReduce
        .reduce((data, text) => {
          const target = data.find(c => c.text === text)
          if(target) {
            target.value = target.value + 1
          } else {
            data.push({
              text,
              value: 1,
            })
          }
          return data
        }, [])

        setTextAnalysed(dataForD3Cloud)
      }  
    })
    }


    useEffect( () => {
        console.log('execute vocab analysis')
      vocabAnalysis()
    }, [])

    return (
        <div>
            <p>Text analysis results below</p>
            <p>{textAnalysed}</p>
        </div>

    )

}    

export default TextMining;
