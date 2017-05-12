import * as RODIN from 'rodin/core';
import THREE from '../libs/three/build/three.js';

class ControlPanel {
    constructor() {
        let fr = document.createElement('div');

        fr.className = 'controlPanel';
        fr.innerHTML = `
            <p>Rotate <button id="rotateX">X</button> | <button id="rotateY">Y</button> | <button id="rotateZ">Z</button></p>
            <p></p>
            <p>Position <span id="targetName"></span></p>
            <p><input type="text" id="posX" class="posInput" placeholder="X"><input type="text" id="posY" class="posInput" placeholder="Y"><input type="text" id="posZ" class="posInput" placeholder="Z"></p>
            <p><button id="chPos">Move</button> | <button id="removeEl">Remove</button></p> 
            <p><hr/></p>
            <p><button id="stop">Stop</button> | <button id="reset">Reset</button> | <button id="testing">Testing</button></p>
        `;

        document.querySelector('#ctrlWrapper').appendChild(fr);
        //fr.querySelector('#startBtn').addEventListener('click', this.onStartClick);

        this.el = fr;

        fr.querySelector('#chPos').addEventListener('mousedown', this.onMoveTarget.bind(this));
        const posInputs = Array.from(document.getElementsByClassName('posInput'));

        posInputs.forEach((el) => {
            el.addEventListener('mousedown', (e) => {e.stopPropagation();});
            el.addEventListener('mousemove', (e) => {e.stopPropagation();});
        });
    }

    on(sel, evt, cb, thisArg) {
        let targetEl = this.el.querySelector(sel);

        if (thisArg) {
            cb = cb.bind(thisArg);
        }

        targetEl.addEventListener(evt, cb);

        return targetEl;
    }

    getTarget() {
        return this.targetEl;
    }

    setTarget(target) {
        this.el.querySelector('#targetName').innerHTML = target.name;
        this.targetEl = target;

        const coords = ['X', 'Y', 'Z'];

        coords.forEach((axe) => {
            this.el.querySelector('#pos' + axe).value = target.position[axe.toLowerCase()];
        });
    }

    onMoveTarget(e) {
        let targetEl = this.getTarget();
        e.stopPropagation();

        if (!targetEl) {
            return false;
        }

        const coords = ['X', 'Y', 'Z'];

        coords.forEach((axe) => {
            const pos = this.el.querySelector('#pos' + axe).value || 0;
            const floatPos = parseFloat(pos, 10);

            console.log('>>> %s - %f', axe, floatPos);
            targetEl.position[axe.toLowerCase()] = floatPos;
        });
    }
}

let cp = new ControlPanel();

RODIN.start();

let cube = new RODIN.Sculpt(
    new THREE.Mesh(
        //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
        new THREE.BoxGeometry(2, 2, 2, 4, 4, 4),
        new THREE.MeshBasicMaterial({wireframe: true, color: 0x00ff00})
    )
);
cube.name = 'cube';

let planeX = new RODIN.Sculpt(
    new THREE.Mesh(
        //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
        new THREE.BoxGeometry(1, 1, 0, 10, 10, 10),
        new THREE.MeshBasicMaterial({wireframe: true, color: 0xb9018d})
    )
);
planeX.name = 'planeX';

let planeY = new RODIN.Sculpt(
    new THREE.Mesh(
        //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
        new THREE.BoxGeometry(1, 1, 0, 10, 10, 10),
        new THREE.MeshBasicMaterial({wireframe: true, color: 0xe3be47})
    )
);
planeY.name = 'planeY';

let planeZ = new RODIN.Sculpt(
    new THREE.Mesh(
        //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
        new THREE.BoxGeometry(1, 1, 0, 10, 10, 10),
        new THREE.MeshBasicMaterial({wireframe: true, color: 0x00ff00})
    )
);
planeZ.name = 'planeZ';

planeX.on(RODIN.CONST.READY, function (event) {
    event.target.position = new THREE.Vector3(-0.5, 2, -2);
});
planeY.on(RODIN.CONST.READY, function (event) { // yellow
    event.target.position = new THREE.Vector3(-0.5, 1.5, -2);
    event.target.rotation.x = Math.PI / 2;
});

//normalize the direction vector (convert to vector of length 1)
//dir.normalize();

let dirX = new THREE.Vector3( 1, 0, 0 );
dirX.normalize();

let dirY = new THREE.Vector3( 0, 1, 0 );
dirY.normalize();

let dirZ = new THREE.Vector3( 0, 0, 1 );
dirZ.normalize();

let origin = new THREE.Vector3( 0, 0, 0 );
let arrow1 = new RODIN.Sculpt(
    new THREE.ArrowHelper( dirX, origin, 1, 0xffffff )
);
let arrow2 = new RODIN.Sculpt(
    new THREE.ArrowHelper( dirY, origin, 2, 0xe3be47 ) // yellow
);
let arrow3 = new RODIN.Sculpt(
    new THREE.ArrowHelper( dirZ, origin, 1, 0x3ba1d4 ) // blue
);

let xyz = new RODIN.Sculpt(
    new THREE.AxisHelper( 50 )
);

planeZ.name = 'planeZ';

RODIN.Scene.add(planeX);
RODIN.Scene.add(planeY);
RODIN.Scene.add(planeZ);

/*RODIN.Scene.add(arrow1);
RODIN.Scene.add(arrow2);
RODIN.Scene.add(arrow3);*/
RODIN.Scene.add(xyz);

const rotateEl = ({axe}) => {
    let d = RODIN.Time.delta / 10000;

    planeX.rotation[axe] += d;
    planeY.rotation[axe] += d;
    planeZ.rotation[axe] += d;
};

const rotateX = (e) => {
    rotateEl({axe: 'x'});
};

const rotateY = () => {
    rotateEl({axe: 'y'});
};

const rotateZ = () => {
    rotateEl({axe: 'z'});
};

const stopRotation = (el) => {
    console.log('stop rotation');

    el.removeEventListener(RODIN.CONST.UPDATE, rotateX);
    el.removeEventListener(RODIN.CONST.UPDATE, rotateY);
    el.removeEventListener(RODIN.CONST.UPDATE, rotateZ);

    console.log('>>> el.rotation x=%f y=%f x=%f', el.rotation.x, el.rotation.y, el.rotation.z);

    // console.log('>>> cube.rotation x=%f y=%f x=%f', cube.rotation.x, cube.rotation.y, cube.rotation.z);
    // console.log('>>> plane.rotation x=%f y=%f x=%f', plane.rotation.x, plane.rotation.y, plane.rotation.z);
};

const hasClass = (el, cls) => {
    return el.className.indexOf(cls) !== -1;
};

const addClass = (el, cls) => {
    if (!hasClass(el, cls)) {
        el.className += ' ' + cls;
    }
};

const removeClass = (el, cls) => {
    let reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');

    el.className = el.className.replace(reg, ' ');
};

let mainEl = planeX;

cp.on('#rotateX', 'click', (e) => {
    if (hasClass(e.target, 'active')) {
        removeClass(e.target, 'active');
        mainEl.removeEventListener(RODIN.CONST.UPDATE, rotateX);
    } else {
        addClass(e.target, 'active');
        mainEl.addEventListener(RODIN.CONST.UPDATE, rotateX);
    }
});

cp.on('#rotateY', 'click', (e) => {
    if (hasClass(e.target, 'active')) {
        removeClass(e.target, 'active');
        mainEl.removeEventListener(RODIN.CONST.UPDATE, rotateY);
    } else {
        addClass(e.target, 'active');
        mainEl.addEventListener(RODIN.CONST.UPDATE, rotateY);
    }
});

cp.on('#rotateZ', 'click', (e) => {
    if (hasClass(e.target, 'active')) {
        removeClass(e.target, 'active');
        mainEl.removeEventListener(RODIN.CONST.UPDATE, rotateZ);
    } else {
        addClass(e.target, 'active');
        mainEl.addEventListener(RODIN.CONST.UPDATE, rotateZ);
    }
});

cp.on('#stop', 'click', () => {
    stopRotation(mainEl);
});

cp.on('#reset', 'click', () => {
    [planeX, planeY, planeZ].forEach((el) => {
        el.rotation.x = 0;
        el.rotation.y = 0;
        el.rotation.z = 0;
    });

    // remove listeners:
    stopRotation(mainEl);
});

cp.on('#removeEl', 'click', () => {
    let el = cp.getTarget();

    if (!el) {
        return false;
    }

    RODIN.Scene.remove(el);
});


// --------------------------------------------------------------------
// start hover animation
// --------------------------------------------------------------------
const hoverInAnimation = new RODIN.AnimationClip("hoverAnim", {scale: {x: 1.1, y: 1.1, z: 1.1}});
const hoverOutAnimation = new RODIN.AnimationClip("hoverOutAnim", {scale: {x: 1, y: 1, z: 1}});

const hoverIn = (evt) => {
    if (evt.target.animation.isPlaying('hoverOutAnim')) {
        evt.target.animation.stop('hoverOutAnim', false);
    }
    evt.target.animation.start('hoverAnim');
};

const hoverOut = (evt) => {
    if (evt.target.animation.isPlaying('hoverAnim')) {
        evt.target.animation.stop('hoverAnim', false);
    }
    evt.target.animation.start('hoverOutAnim');
};

hoverInAnimation.duration(100);
hoverOutAnimation.duration(100);

[planeX, planeY, planeZ].forEach(el => {
    el.animation.add(hoverInAnimation, hoverOutAnimation);
    el.on(RODIN.CONST.GAMEPAD_HOVER, hoverIn);
    el.on(RODIN.CONST.GAMEPAD_HOVER_OUT, hoverOut);
});

// button down event:
const onButtonDown = (evt) => {
    console.log('>>> on button down');
    cp.setTarget(evt.target);
};

[planeX, planeY, planeZ].forEach(el => {
    el.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, onButtonDown);
});

// --------------------------------------------------------------------