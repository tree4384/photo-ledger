# このリポジトリで作業するClaudeへ

施工写真台帳アプリ(GitHub Pagesで公開しているアプリ)です。持ち主はタイチ。
写真を取り込み、Gemini(AI)が写真区分・工種・種別・撮影箇所・内容・備考・黒板の文字を入れ、工種ごと→日付順に並べて、A4縦3枚の施工写真台帳をPDFとExcelで出力する。

## しくみ
- index.html 1枚に全部入り。写真と工事情報は端末のIndexedDB("photo-ledger")に保存(写真本体は長辺1600px)。
- GeminiのAPIキーは localStorage("gemini-key")。tree4384.github.io の電圧降下アプリ(vd-calc)・電線管アプリ(conduit)と同じキーなので、そちらで保存済みなら共有される。モデルは MODELS の上から順に試す。
- 自分で書き換えた欄(photo.man)はAIが上書きしない。
- PDF: 1ページずつキャンバスに描いて jsPDF でまとめる(日本語フォントの埋め込み不要)。Excel: ExcelJS(jsdelivr)。写真台帳シート(A4縦・100%・3枚ごとに改ページ)+一覧シート。

## アプリを更新したら、Googleドライブにバックアップする
タイチの希望で、アプリを更新して main に push したら、そのたびに Googleドライブ「電気 › アプリ」へ zip でバックアップします。
手順とスクリプトは tree4384/vd-calc の CLAUDE.md と同じ。このリポジトリでは KEY=photo-ledger / APP=施工写真台帳 にする。

- バックアップページ: https://claude.ai/artifact/Rzjzq7G4T7dycu5ozNWEAi
- ほかのアプリ: tree4384/vd-calc(電圧降下アプリ)、tree4384/conduit(電線管選定アプリ)

## そのほか
- アプリを更新したら sw.js の CACHE の番号を1つ上げる(iPhoneのホーム画面アプリに新しい版を届けるため)。
