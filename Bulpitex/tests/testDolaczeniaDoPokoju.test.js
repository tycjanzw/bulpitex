var tablicaKodow = [];

function testDolaczania(role, code, tab){
    if(role == 'creater'){ tab.push([code,1]); return true;}
    else{
        var countOfCodes = 0;
        index = 0;
        for(let i=0; i < tab.length; i++){
            if(code == tab[i][0]){ countOfCodes+=1; index = i; i=tab.length; }
        }
        if(countOfCodes == 1){
            if(tab[index][1] < 2){ tab[index][1]+=1; return true; }
            else return false;
        }
        else return false;
    }
}

test('1 osoba dolaczajaca -  pusta tablica kodow', ()=>{
    expect(testDolaczania('joiner', '4856985474', tablicaKodow)).toBe(false);
});

test('3 osoby - 1 tworzaca, 2 dolaczajace', ()=>{
    expect(testDolaczania('creater', '3251498897', tablicaKodow)).toBe(true);
    expect(testDolaczania('joiner', '3251498897', tablicaKodow)).toBe(true);
    expect(testDolaczania('joiner', '3251498897', tablicaKodow)).toBe(false);
});

test('4 osoby - 1 tworzaca, 3 dolaczajace', ()=>{
    expect(testDolaczania('creater', '1254785412', tablicaKodow)).toBe(true);
    expect(testDolaczania('joiner', '1254785412', tablicaKodow)).toBe(true);
    expect(testDolaczania('joiner', '1254785412', tablicaKodow)).toBe(false);
    expect(testDolaczania('joiner', '1254785412', tablicaKodow)).toBe(false);
});

test('1 osoba dolaczajaca - tablica kodow nie jest pusta', ()=>{
    expect(testDolaczania('joiner', '4578541256', tablicaKodow)).toBe(false);
});