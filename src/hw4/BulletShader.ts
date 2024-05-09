import Map from "../Wolfie2D/DataTypes/Collections/Map";
import Mat4x4 from "../Wolfie2D/DataTypes/Mat4x4";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Rect from "../Wolfie2D/Nodes/Graphics/Rect";
import RectShaderType from "../Wolfie2D/Rendering/WebGLRendering/ShaderTypes/RectShaderType";

export default class BulletShader extends RectShaderType {
    private color: Float32Array;

    initBufferObject(): void {
        this.bufferObjectKey = "gradient_circle";
        this.resourceManager.createBuffer(this.bufferObjectKey);
    }

    render(gl: WebGLRenderingContext, options: Record<string, any>): void {
        const program = this.resourceManager.getShaderProgram(this.programKey);
        const buffer = this.resourceManager.getBuffer(this.bufferObjectKey);
        gl.useProgram(program);

        const vertexData = this.getVertices(options.size.x, options.size.y);
        const FSIZE = vertexData.BYTES_PER_ELEMENT;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

        const a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 2 * FSIZE, 0 * FSIZE);
        gl.enableVertexAttribArray(a_Position);

        const u_Color = gl.getUniformLocation(program, "u_Color");
        gl.uniform4fv(u_Color, options.color);

        let maxDimension = Math.max(options.size.x, options.size.y);

        let size = new Vec2(maxDimension, maxDimension).scale(2 / options.worldSize.x, 2 / options.worldSize.y);

        const translateX = (options.position.x - options.origin.x - options.worldSize.x / 2) / maxDimension;
        const translateY = -(options.position.y - options.origin.y - options.worldSize.y / 2) / maxDimension;

        this.translation.translate(new Float32Array([translateX, translateY]));
        this.scale.scale(size);
        this.rotation.rotate(options.rotation);
        let transformation = Mat4x4.MULT(this.translation, this.scale, this.rotation);

        const u_Transform = gl.getUniformLocation(program, "u_Transform");
        gl.uniformMatrix4fv(u_Transform, false, transformation.toArray());

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    getOptions(gc: Rect): Record<string, any> {
        let options: Record<string, any> = {
            position: gc.position,
            size: gc.size,
            rotation: gc.rotation,
            color: gc.color.toArray() 
        }
        return options;
    }
}
