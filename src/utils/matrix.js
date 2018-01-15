/**
 * Created by eason on 17-4-13.
 */

Matrix.Scale = function (v)
{
    if (v.elements.length == 2) {
        let r = Matrix.I(3);
        r.elements[0][0] = v.elements[0];
        r.elements[1][1] = v.elements[1];
        return r;
    }

    if (v.elements.length == 3) {
        let r = Matrix.I(4);
        r.elements[0][0] = v.elements[0];
        r.elements[1][1] = v.elements[1];
        r.elements[2][2] = v.elements[2];
        return r;
    }

    throw "Invalid length for Scale";
};

Matrix.Translation = function (v)
{
    if (v.elements.length == 2) {
        let r = Matrix.I(3);
        r.elements[2][0] = v.elements[0];
        r.elements[2][1] = v.elements[1];
        return r;
    }

    if (v.elements.length == 3) {
        let r = Matrix.I(4);
        r.elements[0][3] = v.elements[0];
        r.elements[1][3] = v.elements[1];
        r.elements[2][3] = v.elements[2];
        return r;
    }

    throw "Invalid length for Translation";
};

Matrix.prototype.flatten = function ()
{
    let result = [];
    if (this.elements.length == 0)
        return [];


    for (let j = 0; j < this.elements[0].length; j++)
        for (let i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
};

Matrix.prototype.ensure4x4 = function()
{
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;

    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;

    for (let i = 0; i < this.elements.length; i++) {
        for (let j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (let i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
            this.elements.push([0, 0, 1, 0]);
        else if (i == 3)
            this.elements.push([0, 0, 0, 1]);
    }

    return this;
};

Matrix.prototype.make3x3 = function()
{
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
        [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
        [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
};

Vector.prototype.flatten = function ()
{
    return this.elements;
};

Vector.prototype.equal = function (v)
{
    return this.e(1)==v.e(1)&&this.e(2)==v.e(2)&&this.e(3)==v.e(3);
};