import request from "supertest";
import { app } from "../src/app";

describe("prestamos", () => {
  it("crea prestamo y marca ejemplar como prestado", async () => {
    const response = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-001", ejemplar_id: "eje-001" })
      .expect(201);

    expect(response.body.data.estado).toBe("ACTIVO");

    const ejemplares = await request(app).get("/libros/lib-001/ejemplares").expect(200);
    expect(ejemplares.body.data.find((item: { id: string }) => item.id === "eje-001").estado).toBe("PRESTADO");
  });

  it("rechaza prestar ejemplar no disponible", async () => {
    await request(app).post("/prestamos").send({ estudiante_id: "est-001", ejemplar_id: "eje-001" }).expect(201);

    const response = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-002", ejemplar_id: "eje-001" })
      .expect(409);

    expect(response.body.error).toBe("ejemplar_no_disponible");
  });

  it("devuelve prestamo y libera ejemplar", async () => {
    const prestamo = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-001", ejemplar_id: "eje-001" })
      .expect(201);

    const response = await request(app).post(`/prestamos/${prestamo.body.data.id}/devolucion`).send({}).expect(200);

    expect(response.body.data.estado).toBe("DEVUELTO");
    expect(response.body.multa).toBeNull();
  });

  it("genera multa por devolucion tardia", async () => {
    const prestamo = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-001", ejemplar_id: "eje-001" })
      .expect(201);

    const lateDate = new Date(prestamo.body.data.fecha_devolucion_esperada);
    lateDate.setDate(lateDate.getDate() + 2);

    const response = await request(app)
      .post(`/prestamos/${prestamo.body.data.id}/devolucion`)
      .send({ fecha_devolucion_real: lateDate.toISOString() })
      .expect(200);

    expect(response.body.multa.valor_total).toBe(4000);
  });

  it("renueva prestamo si no hay solicitud pendiente", async () => {
    const prestamo = await request(app)
      .post("/prestamos")
      .send({ estudiante_id: "est-001", ejemplar_id: "eje-001" })
      .expect(201);

    const response = await request(app).post(`/prestamos/${prestamo.body.data.id}/renovar`).send({}).expect(200);

    expect(response.body.data.renovaciones).toBe(1);
  });
});
