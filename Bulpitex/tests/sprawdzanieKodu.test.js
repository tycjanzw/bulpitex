var tablicaKodow = [];
var tablicaKodow2 = ['3251498897', '2864815301', 
    '5789653010', '2554625385', '0735838523'];

function sprawdzKod(code, tab){
    var countOfCodes = 0;
    if(tab.length == 0)
        return false;
    else{
        for(let i=0; i<tab.length; i++){
            if(code == tab[i]){
                countOfCodes += 1;
                i = tab.length;
            }
        }
        return countOfCodes == 1 ? true : false;
    }
}

test('Kody nie są poprawne', ()=>{
    expect(sprawdzKod('3251498897', tablicaKodow)).toBe(false);
    expect(sprawdzKod('2864815301', tablicaKodow)).toBe(false);
    expect(sprawdzKod('5789653010', tablicaKodow)).toBe(false);
    expect(sprawdzKod('2554625385', tablicaKodow)).toBe(false);
    expect(sprawdzKod('0735838523', tablicaKodow)).toBe(false);
    expect(sprawdzKod('8457548526', tablicaKodow)).toBe(false);
    expect(sprawdzKod('0987678765', tablicaKodow2)).toBe(false);
});

test('Kod są poprawne', ()=>{
    expect(sprawdzKod('3251498897', tablicaKodow2)).toBe(true);
    expect(sprawdzKod('2864815301', tablicaKodow2)).toBe(true);
    expect(sprawdzKod('5789653010', tablicaKodow2)).toBe(true);
    expect(sprawdzKod('2554625385', tablicaKodow2)).toBe(true);
    expect(sprawdzKod('0735838523', tablicaKodow2)).toBe(true);
});