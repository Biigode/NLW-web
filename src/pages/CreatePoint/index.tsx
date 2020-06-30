import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import "./styles.css";
import logo from "../../assets/logo.svg";
import Api from "../../services/api";
import Axios from "axios";
import api from "../../services/api";
interface Item {
  id: number;
  title: string;
  image_url: string;
}
interface UFIBGEsigla {
  sigla: string;
}
interface UFIBGECity {
  nome: string;
}
const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, SetFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  });
  useEffect(() => {
    Api.get("/items").then((Response) => {
      setItems(Response.data);
    });
  }, []);
  useEffect(() => {
    Axios.get<UFIBGEsigla[]>(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    ).then((Response) => {
      const ufInitials = Response.data.map((item) => item.sigla);
      setUfs(ufInitials);
    });
  }, []);
  useEffect(() => {
    if (selectedUf !== "0")
      Axios.get<UFIBGECity[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      ).then((Response) => {
        const citys = Response.data.map((city) => city.nome);
        setCities(citys);
      });
  }, [selectedUf]);

  function handleSelectedUF(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }
  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    SetFormData({ ...formData, [name]: value });
  }
  function handleSelectedItem(event: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === event);

    if (alreadySelected >= 0) {
      const filteredItem = selectedItems.filter((item) => item !== event);
      setSelectedItems(filteredItem);
    } else {
      setSelectedItems([...selectedItems, event]);
    }
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };
    await api.post("points", data);
    alert("Ponto criado com sucesso");
    history.push("/");
  }
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um Endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Selecione um estado (uf)</label>
              <select
                onChange={handleSelectedUF}
                value={selectedUf}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                onChange={handleSelectedCity}
                value={selectedCity}
                name="city"
                id="city"
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Item de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectedItem(item.id)}
                className={selectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar item de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
