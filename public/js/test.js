function clickMessageDisp() {
    var message = document.getElementById("input-message").value; 
    message = "入力したメッセージ：" + message;
    document.getElementById("output-message").innerHTML = message;
}

function ChangeParaToDate() {
    document.getElementById('eid_date').innerHTML = Date();
    }