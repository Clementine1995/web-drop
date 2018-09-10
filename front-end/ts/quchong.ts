function quchong(arr) : Array<number> {
    let temp : Array<number> = []
    for (let index = 0; index < arr.length; index++) {
        if(temp.indexOf(arr[index]) === -1){
            temp.push(arr[index])
        }
    }
    return temp
}

const arr : Array<number> = [1,1,1,1,2,3,4,5,4,4]

const newArr: Array<number> = [...new Set(arr)]
console.log(newArr)

// console.log(quchong(arr))