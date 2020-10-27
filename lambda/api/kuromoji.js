const kuromoji = require('kuromoji')


// インプットとなる文章(長文につき一部省略)
const text = `
そこも場合もうその病気らに対して旨の時がしんませ。
単に事実に使用方はどうかその応用たないでもが思いてならないがも発展思いうべきて、あいにくにもなるだなですた。
`
// kuromoji.jsにバンドルされている辞書のフォルダパス
// kuromoji.jsは形態素解析用関数を生成する際に辞書を読み込む
const DIC_URL = '../../node_modules/kuromoji/dict'

// WordCloudの情報として抽出する品詞（助詞、助動詞などは意味がないので拾わない）
const TARGET_POS = ['名詞', '動詞', '形容詞']

// kuromoji.jsの解析結果の値で特に値がない場合は以下の文字が設定される
const NO_CONTENT = '*'


//module.exports.handler = async function(event, context) {
async function main() {

  // kuromoji.jsによる解析処理
  const words = await new Promise((resolve, reject) => {
    // 辞書を読み混んでトークナイザー（形態素解析するための関数）を生成
    kuromoji.builder({ dicPath: DIC_URL }).build((err, tokenizer) => {
      if(err){
        return reject(err)
      }

      // テキストを引数にして形態素解析
      resolve(tokenizer.tokenize(text)
        // pos（品詞）を参照し、'名詞', '動詞', '形容詞'のみを抽出
        .filter(t => TARGET_POS.includes(t.pos))
        // 単語を抽出(basic_formかsurface_formに単語が存在する)
        .map(t => t.basic_form === NO_CONTENT ? t.surface_form : t.basic_form)
        // [{text: 単語, size: 出現回数}]の形にReduce
        .reduce((data, text) => {
          const target = data.find(c => c.text === text)

          if(target) {
            target.size = target.size + 1
          } else {
            data.push({
              text,
              size: 1,
            })
          }
          return data
        }, [])
        )
    })
  })
    console.log(words)
}
main()

