(function (){
    const arr = [2,2,3,3,5]
    const getNumber = (arr)=>{
        const map = new Map()
        arr.forEach(item=>{
            map.set(item,map.get(item)+1||1)
        })
        let maxCount = 0
        arr.forEach(item=>{
            if(map.get(item)>maxCount){
                maxCount = map.get(item)
            }
            
        })
        return  [...map.keys()].filter(item=>map.get(item)===maxCount)
        console.log(map)
    }

    const callbackStr = (str)=>{
        const arr = str.split('')
        let left = 0;
        let right = arr.length-1;
        while(left<right){
            if(arr[left]!==arr[right]){
                return false
            }
            left++
            right--
        }
        return true
    }

    function longestCommonPrefix(strs) {
        if (strs.length === 0) return '';
        let prefix = strs[0]; // 基准前缀
        for (let i = 1; i < strs.length; i++) {
          // 逐字符对比，直到找到不匹配的位置
          while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, prefix.length - 1);
            if (prefix === '') return ''; // 无公共前缀
          }
        }
        return prefix;
      }
    console.log(longestCommonPrefix(['flower','flow','flight']))
})()