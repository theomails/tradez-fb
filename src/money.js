function getDefaultPlayerMoneyBag(){
    return {
        5:1,
        4:1,
        3:3,
        2:4,
        1:5
    };
}
function getDefaultBankMoneyBag(){
    return {
        5:10,
        4:10,
        3:20,
        2:20,
        1:20
    };
}

function getPossibleDenominations(){
    return [5,4,3,2,1];
}

function neatViewOfBag(bag){
    bag = bag || {};
    var denominations = getPossibleDenominations();
    var resultBag = {};
    denominations.forEach(note => {
        resultBag[note] = bag[note] || 0;
    });
    return resultBag;
}

function transferInline(fromBag, toBag, ops){
    Object.keys(ops).forEach(key => {
        if(ops[key] && ops[key]>0){
            if(!fromBag[key] || fromBag[key]<ops[key]){
                throw new Error(`${ops[key]} notes of ${key} are not available to transfer.`);
            }
        }
    });

    Object.keys(ops).forEach(key => {
        if(ops[key] && ops[key]>0){
            toBag[key] = (toBag[key]||0) + ops[key];
            fromBag[key] = (fromBag[key]||0) - ops[key];
        }
    });
}

export default {getDefaultPlayerMoneyBag, getDefaultBankMoneyBag, getPossibleDenominations, neatViewOfBag, transferInline};