// @ts-nocheck
import { useEffect, useState } from "react";
import {
  Grid,
  makeStyles,
  IconButton,
  Hidden,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
import useApi from "@/lib/useApi";
import { useAppContext } from "@/providers/AppContext";
import { useRouter } from "next/router";
import TreeSummary from "@/components/Tree/Infos/Summary";
import TreeForm from "@/components/Tree/Form";
import { TMapToolbarAction } from "@/components/Map/Toolbar";
import MapGeolocateFab from "@/components/Map/GeolocateFab";
import MapLayers from "@/components/Map/Layers";
import MapFilter from "@/components/Map/Filter";
import useLocalStorage from "@/lib/hooks/useLocalStorage";
import { useThemeContext } from "@/lib/hooks/useThemeSwitcher";
import AppLayoutCarto from "@/components/AppLayout/Carto";
import PanelStartGeneralInfo from "@/components/Panel/Start/GeneralInfo";
import MapModeSwitch from "@/components/Map/ModeSwitch";
import MapDrawToolbar from "@/components/Map/DrawToolbar";
import MapSearchCity from "@/components/Map/SearchCity";
import ImportPanel from "@/components/Import/Panel/Index";
import InterventionForm from "@/components/Interventions/Form";
import getConfig from "next/config";
import { FlyToInterpolator } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { MVTLayer } from "@deck.gl/geo-layers";
import { SelectionLayer } from "nebula.gl";
import { StaticMap } from "react-map-gl";
import Head from "next/head";
import { ITree } from "@/components";
import InterventionsEdit from "@/components/Interventions/Panel";
import geobuf from "geobuf";
import Pbf from "pbf";
import { useTranslation } from "react-i18next";
import MapActionsBar, {
  MapActionsBarActionType,
} from "@/components/Map/ActionsBar";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    position: "absolute",
    top: 16,
    left: 60,
    width: "calc(100% - 68px)",
    pointerEvents: "none",
  },
  toolbarAction: {
    pointerEvents: "fill",
  },
  actionsBar: {
    position: "absolute",
    top: 8,
    left: 8,
    display: "flex",
    flexDirection: "column",
  },
  fabProgress: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(8),
    zIndex: 1,
  },
}));

const defaultViewState = {
  longitude: 2.54,
  latitude: 46.7,
  zoom: 5,
};

const defaultFilter = {
  canonicalName: [],
  vernacularName: [],
};

const defaultFilters = {
  filters: defaultFilter,
  options: defaultFilter,
  values: defaultFilter,
};

const defaultData = {
  type: "FeatureCollection",
  features: [],
};

const EditionPage = ({}) => {
  const { t } = useTranslation();
  const { publicRuntimeConfig } = getConfig();
  const { apiUrl } = publicRuntimeConfig;
  const classes = useStyles();
  const router = useRouter();
  const { user } = useAppContext();
  const { dark } = useThemeContext();
  const { apiETK } = useApi().api;
  const [numberOfTrees, setNumberOfTrees] = useState(0);
  const [data, setData] = useLocalStorage("etk:map:data");
  const [dataOrganizations, setDataOrganizations] = useLocalStorage(
    "etk:map:dataOrganizations",
    {}
  );
  const [drawerLeftComponent, setDrawerLeftComponent] = useState();
  const [drawerLeftWidth, setDrawerLeftWidth] = useState(400);
  const [initialViewState, setInitialViewState] = useLocalStorage(
    "etk:map:viewstate",
    defaultViewState
  );
  const [loadDataProgress, setLoadDataProgress] = useState(0);
  const [viewState, setViewState] = useState();
  const [mode, setMode] = useState("selection");
  const [filters, setFilters] = useState(defaultFilters);
  const [selection, setSelection] = useState([]);
  const [editionMode, setEditionMode] = useState<boolean>(false);
  const [mapBackground, setMapbackground] = useLocalStorage(
    "etk:map:mapBackground",
    "map"
  );
  const [layers, setLayers] = useState([]);
  const [activeTree, setActiveTree] = useState<number | undefined>(
    router.query?.tree ? Number(router.query.tree) : undefined
  );
  const [loading, setLoading] = useState(false);

  const [dataOrganizationId, setDataOrganizationId] = useLocalStorage(
    "etk:map:dataOrganizationId",
    user?.currentOrganization.id
  );

  const createTree = async (x, y) => {
    try {
      const organizationId = user.currentOrganization.id;
      const payload = { x, y };
      const url = `/organization/${organizationId}/trees`;

      const { status, data: tree } = await apiETK.post(url, payload);

      if (status === 200) {
        const newData = { ...data };
        const feature = {
          id: String(newData.features.length),
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [x, y],
          },
          properties: tree,
        };

        newData.features.push(feature);

        setData(newData);

        router.push(`/map/?panel=edit&tree=${tree.id}`);
        setActiveTree(tree.id);
      }
    } catch (error) {}
  };

  const getData = async (id: number) => {
    try {
      setLoading(true);
      const { status, data: newData } = await apiETK.get(
        `/maps/geobuf?organization_id=${id}`,
        {
          onDownloadProgress: ({ loaded, total }) => {
            const progress = Math.floor((loaded / total) * 100);

            setLoadDataProgress(progress);
          },
          responseType: "arraybuffer",
        }
      );

      setData(defaultData);
      setDataOrganizations({ ...dataOrganizations, [id]: defaultData });

      if (status === 200 && newData) {
        const pbf = new Pbf(newData);
        const geojson = geobuf.decode(pbf);

        geojson.features = geojson.features.map((f) => {
          const newFeature = { ...f };
          try {
            newFeature.properties.properties = JSON.parse(
              newFeature.properties.properties
            );
          } catch (error) {
          } finally {
            return newFeature;
          }
        });

        setDataOrganizations({ ...dataOrganizations, [id]: geojson });
        setData(geojson);
        setLoadDataProgress(0);
      }
    } catch (error) {
      setData(defaultData);
    } finally {
      setDataOrganizationId(id);
      setLoading(false);
    }
  };

  const handleOnTreeSave = (tree: ITree) => {
    const newData = { ...data };
    const index = newData.features.findIndex(
      (f) => f.properties.id === tree.id
    );

    if (index) {
      newData.features[index].properties = tree;
      setData(newData);
    }
  };

  const osmLayer = new MVTLayer({
    id: "osm",
    data: `${apiUrl.replace(
      "/api/v1",
      ""
    )}/tiles/osm/{z}/{x}/{y}.pbf?scope=public`,
    minZoom: 0,
    maxZoom: 13,
    getRadius: 1,
    radiusScale: 10,
    radiusMinPixels: 0.25,
    lineWidthMinPixels: 1,
    pointRadiusMinPixels: 1,
    pointRadiusMaxPixels: 10,
    pointRadiusScale: 2,
    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],
    pickable: true,
  });

  const treesLayer = new GeoJsonLayer({
    id: "trees",
    data,
    getLineColor: (d) => {
      if (selection.includes(d.properties.id)) {
        return [255, 0, 0, 100];
      }

      if (activeTree === d.properties.id) {
        return [255, 100, 0];
      }

      for (const key of Object.keys(filters.filters).reverse()) {
        if (
          filters.filters[key] &&
          d.properties.properties &&
          filters.filters[key].includes(d.properties?.properties[key])
        ) {
          const index = filters.options[key].findIndex(
            (f) => f.value === d.properties.properties[key]
          );
          return filters.options[key][index][dark ? "color" : "background"];
        }
      }

      for (let key in filters.filters) {
        if (filters.filters[key].length > 0) {
          return [120, 120, 120, 128];
        }
      }

      return [34, 169, 54, 100];
    },
    getFillColor: (d) => {
      if (selection.includes(d.properties.id)) {
        return [255, 0, 0, 100];
      }

      if (activeTree === d.properties.id) {
        return [255, 100, 0];
      }

      for (const key of Object.keys(filters.filters).reverse()) {
        if (
          filters.filters[key] &&
          d.properties.properties &&
          filters.filters[key].includes(d.properties?.properties[key])
        ) {
          const index = filters.options[key].findIndex(
            (f) => f.value === d.properties.properties[key]
          );

          return filters.options[key][index][dark ? "color" : "background"];
        }
      }

      for (let key in filters.filters) {
        if (filters.filters[key].length > 0) {
          return [120, 120, 120, 128];
        }
      }

      return [34, 139, 34, 100];
    },
    updateTriggers: {
      getFillColor: [activeTree, selection, editionMode, filters, dark, data],
      getLineColor: [activeTree, selection, editionMode, filters, dark, data],
    },
    pickable: true,
    autoHighlight: true,
    getRadius: (d) => (activeTree === d.properties.id ? 15 : 3),
    pointRadiusMinPixels: 2,
    pointRadiusMaxPixels: 15,
    pointRadiusScale: 2,
    minRadius: 10,
    radiusMinPixels: 0.5,
    lineWidthMinPixels: 1,
  });

  const selectionLayer = new SelectionLayer({
    selectionType: "rectangle",
    onSelect: ({ pickingInfos }) => {
      const ids = pickingInfos.map((o) => o.object.properties.id);
      setSelection(ids);
    },
    layerIds: ["trees"],
    getTentativeFillColor: () => [255, 0, 255, 100],
    getTentativeLineColor: () => [0, 0, 255, 255],
    getTentativeLineDashArray: () => [0, 0],
    lineWidthMinPixels: 1,
  });

  const fitToBounds = async (organizationId: number) => {
    try {
      const { status, data: bbox } = await apiETK.get(`/maps/bbox`, {
        params: {
          organization_id: organizationId,
        },
      });

      if (status === 200 && bbox.xmin && bbox.ymin && bbox.xmax && bbox.ymax) {
        const newViewState = layers[0].context.viewport.fitBounds(
          [
            [bbox.xmin, bbox.ymin],
            [bbox.xmax, bbox.ymax],
          ],
          {
            padding: 100,
          }
        );

        setInitialViewState({
          longitude: newViewState.longitude,
          latitude: newViewState.latitude,
          zoom: newViewState.zoom,
        });

        setViewState({
          ...newViewState,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
        });
      } else {
        setInitialViewState(defaultViewState);
        setViewState({
          ...defaultViewState,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
        });
      }
    } catch (e) {}
  };

  const handleOnFileImported = async (coordinates) => {
    await getData(user.currentOrganization.id);
    setViewState({
      longitude: coordinates[0],
      latitude: coordinates[1],
      zoom: 15,
      transitionDuration: 1200,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const switchPanel = (panel) => {
    if (panel !== "edit") {
      setDrawerLeftWidth(400);
    }

    switch (panel) {
      case "start":
        return setDrawerLeftComponent(
          <PanelStartGeneralInfo numberOfTrees={data?.features.length} />
        );
      case "info":
        return setDrawerLeftComponent(<TreeSummary treeId={activeTree} />);
      case "edit":
        setDrawerLeftWidth(500);
        return setDrawerLeftComponent(
          <TreeForm treeId={activeTree} onSave={handleOnTreeSave} />
        );
      case "layers":
        return setDrawerLeftComponent(
          <MapLayers
            mapBackground={mapBackground}
            onChangeBackground={(newMapBackground) =>
              setMapbackground(newMapBackground)
            }
          />
        );
      case "import":
        return setDrawerLeftComponent(
          <ImportPanel onFileImported={handleOnFileImported} />
        );
      case "intervention":
        return setDrawerLeftComponent(<InterventionForm />);
      case "intervention-edit":
        return setDrawerLeftComponent(<InterventionsEdit />);
      case "filter":
        return setDrawerLeftComponent(
          <MapFilter
            initialValue={filters.values}
            organizationId={user.currentOrganization.id}
            onChange={handleOnFilter}
          />
        );
    }
  };

  useEffect(() => {
    setViewState({ ...initialViewState });
    renderLayers();

    fitToBounds(user?.currentOrganization.id);

    if (!data?.features.length) {
      getData(user?.currentOrganization.id);
    }
  }, []);

  useEffect(() => {
    if (router.query?.tree) {
      setActiveTree(Number(router.query.tree));
    }

    if (router.query?.panel) {
      switchPanel(router.query?.panel);
    }
  }, [router.query, numberOfTrees, filters]);

  const handleOnFilter = (values, filters, options) => {
    setFilters({
      options,
      filters,
      values,
    });
  };

  const handleOnMapToolbarChange = (action: TMapToolbarAction) => {
    switch (action) {
      case "geolocate":
        break;
      case "fit_to_bounds":
        fitToBounds(user.currentOrganization.id);
        break;
    }
  };

  const handleOnMapModeSwitch = (newMode) => {
    if (newMode) {
      if (newMode === "edition") {
        setMode("selection");
      } else {
        setMode("");
      }

      setEditionMode(newMode === "edition");
    }
  };

  const handleOnDeleteTrees = async () => {
    if (!selection.length) {
      return;
    }

    try {
      const url = `/organization/${user.currentOrganization.id}/trees/bulk_delete`;
      const { status, data: tree } = await apiETK.delete(url, {
        data: {
          trees: selection,
        },
      });

      if (status === 200) {
        const newData = { ...data };
        newData.features = newData.features.filter(
          (t) => !selection.includes(t.properties.id)
        );

        setData(newData);

        if (selection.includes(activeTree)) {
          setActiveTree();
          setDrawerLeftComponent();
          router.push("/map");
        }

        setSelection([]);
      }
    } catch (e) {}
  };

  const renderLayers = () => {
    switchPanel(router.query.panel);

    if (editionMode && mode === "selection") {
      return setLayers([treesLayer, selectionLayer]);
    }

    if (editionMode) {
      return setLayers([treesLayer]);
    }

    return setLayers([osmLayer, treesLayer]);
  };

  const handleOnMapActionsBarClick = (action: MapActionsBarActionType) => {
    if (action === "menu") {
      !drawerLeftComponent
        ? switchPanel(router.query.panel)
        : setDrawerLeftComponent();

      return;
    }

    router.push({
      query: {
        ...router.query,
        panel: action,
      },
    });
  };

  useEffect(() => {
    if (mode !== "selection") {
      setSelection([]);
      setLayers([osmLayer, treesLayer]);
    } else {
      setLayers([treesLayer, selectionLayer]);
    }
  }, [mode]);

  useEffect(() => {
    if (user) {
      setFilters(defaultFilters);
      renderLayers();

      if (dataOrganizationId !== user.currentOrganization.id) {
        if (
          dataOrganizations[user.currentOrganization.id]?.features.length > 0
        ) {
          setDataOrganizationId(user.currentOrganization.id);
          setData(dataOrganizations[user.currentOrganization.id]);
        } else {
          getData(user?.currentOrganization.id);
        }
      }

      fitToBounds(user.currentOrganization.id);
      setDrawerLeftComponent();
    }
  }, [user]);

  useEffect(() => {
    renderLayers();
  }, [activeTree, editionMode, selection, filters, dark, data]);

  return (
    <AppLayoutCarto
      drawerLeftComponent={drawerLeftComponent}
      drawerLeftWidth={drawerLeftWidth}
      onMapToolbarChange={handleOnMapToolbarChange}
    >
      <Head>
        <title>ecoTeka - Map</title>
      </Head>
      <DeckGL
        viewState={viewState}
        controller={true}
        getCursor={({}) => (mode === "drawPoint" ? "crosshair" : "pointer")}
        layers={layers}
        onLoad={() => {
          fitToBounds(user?.currentOrganization.id);
        }}
        onViewStateChange={(e) => {
          setInitialViewState({
            longitude: e.viewState.longitude,
            latitude: e.viewState.latitude,
            zoom: e.viewState.zoom,
          });
          setViewState(e.viewState);
        }}
        onClick={(info) => {
          if (editionMode && mode === "drawPoint") {
            const [x, y] = info.coordinate;

            return createTree(x, y);
          }

          if (
            info.object?.properties?.id === activeTree ||
            !info.object?.properties?.id
          ) {
            setActiveTree();
            router.push("/map");
            setDrawerLeftComponent();
          } else {
            setActiveTree(info.object?.properties?.id);
            router.push(`/map/?panel=info&tree=${info.object?.properties.id}`);
          }
        }}
      >
        <StaticMap
          mapStyle={`/api/v1/maps/style/?theme=${
            dark ? "dark" : "light"
          }&background=${mapBackground}`}
        ></StaticMap>
        {navigator?.geolocation && (
          <MapGeolocateFab
            onGeolocate={() => {
              navigator.geolocation.getCurrentPosition((position) => {
                setViewState({
                  ...viewState,
                  longitude: position.coords.longitude,
                  latitude: position.coords.latitude,
                  zoom: 18,
                  transitionDuration: 1500,
                  transitionInterpolator: new FlyToInterpolator(),
                });
              });
            }}
          />
        )}
        {loading && (
          <div className={classes.fabProgress}>
            <Grid container justify="center" alignItems="center" spacing={2}>
              <Grid item>
                <Typography color="textPrimary">
                  {t("common.loading")}
                </Typography>
              </Grid>
              <Grid item>
                <CircularProgress
                  color="primary"
                  variant="determinate"
                  size={30}
                  thickness={10}
                  value={loadDataProgress}
                />
              </Grid>
            </Grid>
          </div>
        )}
      </DeckGL>
      <MapActionsBar
        isMenuOpen={drawerLeftComponent !== undefined}
        darkBackground={mapBackground !== "map"}
        onClick={handleOnMapActionsBarClick}
      />
      <Hidden smDown>
        <Grid
          container
          justify="center"
          alignItems="center"
          className={classes.toolbar}
        >
          <Grid item className={classes.toolbarAction}>
            <MapModeSwitch
              initValue={editionMode ? "edition" : "analysis"}
              onChange={handleOnMapModeSwitch}
            />
          </Grid>
          <Grid item xs></Grid>
          {editionMode && (
            <Grid item className={classes.toolbarAction}>
              <MapDrawToolbar
                activeDelete={Boolean(selection.length)}
                onDelete={handleOnDeleteTrees}
                onChange={(newMode) => {
                  if (newMode) {
                    setMode(newMode);
                  }
                }}
              />
            </Grid>
          )}
          <Grid item xs></Grid>
          <Grid item className={classes.toolbarAction}>
            <MapSearchCity
              onChange={(coordinates) => {
                setViewState({
                  ...viewState,
                  longitude: coordinates[0],
                  latitude: coordinates[1],
                  zoom: 15,
                  transitionDuration: 1500,
                  transitionInterpolator: new FlyToInterpolator(),
                });
              }}
            />
          </Grid>
          <Grid item className={classes.toolbarAction}>
            <IconButton
              onClick={() => fitToBounds(user.currentOrganization.id)}
            >
              <CenterFocusStrongIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Hidden>
    </AppLayoutCarto>
  );
};

export default EditionPage;
