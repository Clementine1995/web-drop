enum Choose {
    wife = 1,
    mother = 2
}

function question(choose:Choose){
    console.log('which one do u wanna save first?')
    console.log('your choice is ' + choose)
}

question(Choose.mother)