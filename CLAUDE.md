# このリポジトリで作業するClaudeへ

施工写真台帳アプリ(GitHub Pagesで公開しているアプリ)です。持ち主はタイチ。
写真を取り込み、Gemini(AI)が写真区分・工種・種別・撮影箇所・内容・備考・黒板の文字を入れ、工種ごと→日付順に並べて、A4縦3枚の施工写真台帳をPDFとExcelで出力する。

## しくみ
- index.html 1枚に全部入り。写真と工事情報は端末のIndexedDB("photo-ledger")に保存(写真本体は長辺1600px)。
- GeminiのAPIキーは localStorage("gemini-key")。tree4384.github.io の電圧降下アプリ(vd-calc)・電線管アプリ(conduit)と同じキーなので、そちらで保存済みなら共有される。モデルは MODELS の上から順に試す。
- 自分で書き換えた欄(photo.man)はAIが上書きしない。
- 取り込んだらAIが自動で仕分けする(工程 koutei も判定)。手で直すときは「振り分け」: ①撮影箇所 → ②工程 → ③一覧で写真をタップ → 反映。工程を決めると写真区分・種別も KOUTEI の表どおりに入る。
- 並べ方: 工種別(工種→工程→撮影日)/場所別(撮影箇所→工程→撮影日)/日付順/追加順。台帳もこの並びで出力。工事情報(工事名・工事場所・施工者)はメイン画面。
- PDF: 1ページずつキャンバスに描いて jsPDF でまとめる(日本語フォントの埋め込み不要)。Excel: ExcelJS(jsdelivr)。写真台帳シート(A4縦・100%・3枚ごとに改ページ)+一覧シート。

## アプリを更新したら、Googleドライブにバックアップする
タイチの希望で、アプリを更新して main に push したら、そのたびに Googleドライブ「電気 › アプリ」へ zip でバックアップします。
手順とスクリプトは tree4384/vd-calc の CLAUDE.md と同じ。このリポジトリでは KEY=photo-ledger / APP=施工写真台帳 にする。

- バックアップページ: https://claude.ai/artifact/Rzjzq7G4T7dycu5ozNWEAi
- ArtifactData(file_path渡し)が使えないセッションでは、Google Drive の create_file に base64Content を「sha256:<ハッシュ>:<zipの絶対パス>」のファイル参照で渡して「電気/アプリ」フォルダへ直接上げる(中身は書き写さない)。そのあと同じアプリの古いzipはゴミ箱へ。
- ほかのアプリ: tree4384/vd-calc(電圧降下アプリ)、tree4384/conduit(電線管選定アプリ)

## そのほか
- アプリを更新したら sw.js の CACHE の番号を1つ上げる(iPhoneのホーム画面アプリに新しい版を届けるため)。
