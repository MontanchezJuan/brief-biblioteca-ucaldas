import request from "supertest";
import { app } from "../src/app";

describe("multas", () => {
  it("lista y paga una multa", async () => {
    const prestamo = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-001", ejemplar_id: "eje-001" })
      .expect(201);

    const lateDate = new Date(prestamo.body.data.fecha_devolucion_esperada);
    lateDate.setDate(lateDate.getDate() + 1);

    const devolucion = await request(app)
      .post(`/prestamos/${prestamo.body.data.id}/devolucion`)
      .send({ fecha_devolucion_real: lateDate.toISOString() })
      .expect(200);

    const multas = await request(app).get("/multas?pagada=false").expect(200);
    expect(multas.body.data).toHaveLength(1);

    const pago = await request(app).post(`/multas/${devolucion.body.multa.id}/pagar`).send({}).expect(200);
    expect(pago.body.data.pagada).toBe(true);
  });
});
