function returnText(){
    var res = document.getElementById("returned_text");
    var txt = text_form.text1.value;
    if (txt == ""){
        console.log("text is not input");
        res.innerHTML = "text is not input";
        // return false;    //送信ボタン本来の動作をキャンセルします
    }else{
        res.innerHTML = txt;
        console.log(txt);
        // return true;    //送信ボタン本来の動作を実行します
    }
}