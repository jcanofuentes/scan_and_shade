import React from 'react';

class Joystick extends React.Component {
    state = {
        x: 0,
        y: 0,
    }

    handleMouseMove = (event) => {
        this.setState({
            x: event.clientX,
            y: event.clientY,
        });
    }

    render() {
        const { x, y } = this.state;

        return (
            <div
                style={{ height: '120px', width: '120px', position: 'relative', backgroundColor: '#eee' }}
                onMouseMove={this.handleMouseMove}
            >
                <div
                    style={{ position: 'absolute', top: `${y}px`, left: `${x}px`, width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'blue' }}
                />
            </div>
        );
    }
}

    /*   
    render() {
        return (
            <div style={{ position: "relative" }}>
                <Joystick
                    style={{
                        position: "absolute",
                        top: "10px", // ajusta según sea necesario
                        left: "10px", // ajusta según sea necesario
                        zIndex: 1000 // cualquier número alto para que esté en la parte superior
                    }}
                />
                <div
                    style={{ width: "100vw", height: "75vw" }}
                    ref={ref => (this.mount = ref)}
                />
            </div>
        );
    }
    */
export default Joystick;