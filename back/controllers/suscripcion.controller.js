const SuscripcionModel = require('../modelo/suscripcionContacto');

async function suscribirse(req, res) {
    try{
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'El email es obligatorio' });
        }

        const existe = await SuscripcionModel.emailExistente(email);
        if (existe) {
            return res.status(409).json({ message: 'El email ya está suscrito' });
        }

        const nuevaSuscripcionId =  await SuscripcionModel.crearSuscripcion(email);
        return res.status(201).json({ message: 'Suscripción registrada correctamente', id: nuevaSuscripcionId });
    }
    catch (err) {
        console.error('Error en suscribirse:', err);
        return res.status(500).json({ message: 'Error al crear suscripción' });
    }
}

async function contacto(req, res) {
    try{
        const { nombre, email, mensaje } = req.body;
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ message: 'Nombre, email y mensaje son obligatorios' });
        }
        const nuevoContactoId =  await SuscripcionModel.crearContacto(nombre, email, mensaje);
        return res.status(201).json({ message: 'Mensaje enviado correctamente', id: nuevoContactoId });
    }catch (err) {
        console.error('Error en contacto:', err);
        return res.status(500).json({ message: 'Error al crear contacto' });
    }
}

module.exports = {
    suscribirse,
    contacto
};