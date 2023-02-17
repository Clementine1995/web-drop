function ajax() {
  let xhr = new XMLHttpRequest()

  xhr.open('get', 'https://www.baidu.com')

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        let string = xhr.responseText
        let object = JSON.parse(string)
        console.log(object)
      }
    }
  }

  xhr.send()
}